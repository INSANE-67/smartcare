import { getConversations } from "@/lib/dal/chat";
import { startNewChat } from "@/lib/actions/chat";
import Link from "next/link";
import { MessageSquare, Plus, Clock } from "lucide-react";

export default async function PatientChatPage() {
  const conversations = await getConversations();

  return (
    <div className="max-w-4xl mx-auto py-8 px-4">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Health Assistant</h1>
          <p className="text-gray-600 mt-2">Chat with our AI symptom checker for general wellness advice.</p>
        </div>
        <form action={startNewChat}>
          <button type="submit" className="flex items-center gap-2 bg-blue-600 text-white px-4 py-2 rounded-md hover:bg-blue-700 transition-colors">
            <Plus className="w-4 h-4" />
            New Chat
          </button>
        </form>
      </div>

      <div className="bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
        <div className="p-4 border-b border-gray-200 bg-slate-50">
          <h2 className="font-semibold text-gray-800">Your Conversations</h2>
        </div>
        
        {conversations.length === 0 ? (
          <div className="p-8 text-center text-gray-500">
            <MessageSquare className="w-12 h-12 mx-auto text-gray-300 mb-4" />
            <p>No conversations yet. Start a new chat above.</p>
          </div>
        ) : (
          <ul className="divide-y divide-gray-100">
            {conversations.map((conv) => (
              <li key={conv.id}>
                <Link 
                  href={`/patient/chat/${conv.id}`}
                  className="flex items-center gap-4 p-4 hover:bg-slate-50 transition-colors"
                >
                  <div className="bg-blue-100 p-3 rounded-full text-blue-600 shrink-0">
                    <MessageSquare className="w-5 h-5" />
                  </div>
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">
                      {conv.title || "New Conversation"}
                    </p>
                    <div className="flex items-center gap-1 text-xs text-gray-500 mt-1">
                      <Clock className="w-3 h-3" />
                      <span>{new Date(conv.updated_at).toLocaleDateString()}</span>
                    </div>
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </div>
      
      <div className="mt-8 bg-amber-50 border border-amber-200 p-4 rounded-md">
        <p className="text-sm text-amber-800 font-medium">
          <strong>Disclaimer:</strong> This AI assistant is for informational purposes only and is not a substitute for professional medical advice, diagnosis, or treatment. Always seek the advice of your physician or other qualified health provider with any questions you may have regarding a medical condition.
        </p>
      </div>
    </div>
  );
}
