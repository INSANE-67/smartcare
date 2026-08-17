import { getConversationById, getMessagesByConversationId } from "@/lib/dal/chat";
import { ChatInterface } from "@/components/chat/chat-interface";
import { notFound } from "next/navigation";
import Link from "next/link";
import { ChevronLeft } from "lucide-react";

export default async function ConversationPage({ params }: { params: { id: string } }) {
  const conversation = await getConversationById(params.id);

  if (!conversation) {
    notFound();
  }

  const initialMessages = await getMessagesByConversationId(conversation.id);

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="mb-6">
        <Link href="/patient/chat" className="inline-flex items-center text-sm font-medium text-blue-600 hover:text-blue-700">
          <ChevronLeft className="w-4 h-4 mr-1" />
          Back to Conversations
        </Link>
      </div>
      
      <ChatInterface 
        conversationId={conversation.id} 
        initialMessages={initialMessages} 
      />
    </div>
  );
}
