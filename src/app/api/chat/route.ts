/* eslint-disable @typescript-eslint/no-explicit-any */
import { streamText } from "ai";
import { google } from "@ai-sdk/google";
import { createSupabaseServerClient } from "@/lib/supabase/server";
import { createSupabaseAdminClient } from "@/lib/supabase/admin";
import { SYSTEM_PROMPT } from "@/lib/ai/prompts";
import { NextResponse } from "next/server";

export async function POST(req: Request) {
  try {
    const { messages, conversationId } = await req.json();

    if (!conversationId) {
      return NextResponse.json({ error: "Missing conversationId" }, { status: 400 });
    }

    const supabase = await createSupabaseServerClient();
    const { data: { user } } = await supabase.auth.getUser();

    if (!user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    // Verify conversation belongs to user
    const { data: conversation, error: convError } = await supabase
      .from("conversations")
      .select("id")
      .eq("id", conversationId)
      .eq("patient_id", user.id)
      .single();

    if (convError || !conversation) {
      return NextResponse.json({ error: "Conversation not found or unauthorized" }, { status: 403 });
    }

    const adminClient = createSupabaseAdminClient();

    // The last message in the array is the new user message
    const latestMessage = messages[messages.length - 1];
    
    // Save user message to DB securely
    await (supabase.from("messages") as any).insert({
      conversation_id: conversationId,
      role: latestMessage.role,
      content: latestMessage.content,
    });

    // Prepare messages with system prompt
    const aiMessages = [
      { role: "system", content: SYSTEM_PROMPT },
      ...messages.map((m: { role: string; content: string }) => ({ role: m.role, content: m.content })),
    ];

    const result = streamText({
      model: google("gemini-1.5-flash") as any,
      messages: aiMessages,
      async onFinish({ text, usage }) {
        // Save assistant message using Service Role to bypass RLS
        await (adminClient.from("messages") as any).insert({
          conversation_id: conversationId,
          role: "assistant",
          content: text,
        });

        // Save token usage
        await (adminClient.from("ai_usage_logs") as any).insert({
          patient_id: user.id,
          conversation_id: conversationId,
          prompt_tokens: (usage as any).promptTokens || 0,
          completion_tokens: (usage as any).completionTokens || 0,
          total_tokens: (usage as any).totalTokens || 0,
        });
        
        // Update conversation updated_at (and title if it's the first message)
        const updateData: { updated_at: string; title?: string } = { updated_at: new Date().toISOString() };
        if (messages.length === 1) {
          updateData.title = latestMessage.content.slice(0, 50) + (latestMessage.content.length > 50 ? "..." : "");
        }
        await (adminClient.from("conversations") as any).update(updateData).eq("id", conversationId);
      },
    });

    return (result as any).toDataStreamResponse ? (result as any).toDataStreamResponse() : (result as any).toTextStreamResponse();
  } catch (error) {
    console.error("Chat API Error:", error);
    return NextResponse.json({ error: "Internal Server Error" }, { status: 500 });
  }
}
