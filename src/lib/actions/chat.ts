"use server";

import { createConversation } from "@/lib/dal/chat";
import { redirect } from "next/navigation";

export async function startNewChat() {
  const conversation = await createConversation("New Conversation");
  
  if (!conversation) {
    throw new Error("Failed to create conversation");
  }

  redirect(`/patient/chat/${conversation.id}`);
}
