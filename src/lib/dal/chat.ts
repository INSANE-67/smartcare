/* eslint-disable @typescript-eslint/no-explicit-any */
import { createSupabaseServerClient } from "../supabase/server";

export interface Conversation {
  id: string;
  patient_id: string;
  title: string | null;
  created_at: string;
  updated_at: string;
}

export interface Message {
  id: string;
  conversation_id: string;
  role: "user" | "assistant" | "system" | "data";
  content: string;
  created_at: string;
}

export async function getConversations(): Promise<Conversation[]> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .order("updated_at", { ascending: false });

  if (error) {
    console.error("Error fetching conversations:", error);
    return [];
  }

  return data as Conversation[];
}

export async function getConversationById(id: string): Promise<Conversation | null> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("conversations")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    return null;
  }

  return data as Conversation;
}

export async function getMessagesByConversationId(conversationId: string): Promise<Message[]> {
  const supabase = await createSupabaseServerClient();

  const { data, error } = await supabase
    .from("messages")
    .select("*")
    .eq("conversation_id", conversationId)
    .order("created_at", { ascending: true });

  if (error) {
    console.error("Error fetching messages:", error);
    return [];
  }

  return data as Message[];
}

export async function createConversation(title: string): Promise<Conversation | null> {
  const supabase = await createSupabaseServerClient();
  const { data: { user } } = await supabase.auth.getUser();

  if (!user) {
    throw new Error("Unauthorized");
  }

  const { data, error } = await (supabase
    .from("conversations") as any)
    .insert({ patient_id: user.id, title })
    .select()
    .single();

  if (error) {
    console.error("Error creating conversation:", error);
    return null;
  }

  return data as Conversation;
}
