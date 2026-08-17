/* eslint-disable @typescript-eslint/no-explicit-any */
"use client";

import { useChat } from "ai/react";
import { useEffect, useRef } from "react";
import { Send, User, Bot, AlertTriangle } from "lucide-react";
import type { Message as DALMessage } from "@/lib/dal/chat";

interface ChatInterfaceProps {
  conversationId: string;
  initialMessages: DALMessage[];
}

export function ChatInterface({ conversationId, initialMessages }: ChatInterfaceProps) {
  // Convert DB messages to AI SDK format
  const formattedInitialMessages = initialMessages.map(m => ({
    id: m.id,
    role: m.role as "user" | "assistant" | "system" | "data",
    content: m.content
  }));

  const { messages, input, handleInputChange, handleSubmit, isLoading } = useChat({
    api: "/api/chat",
    body: {
      conversationId,
    },
    initialMessages: formattedInitialMessages,
  });

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto-scroll to bottom
  useEffect(() => {
    if (messagesEndRef.current) {
      messagesEndRef.current.scrollIntoView({ behavior: "smooth" });
    }
  }, [messages]);

  return (
    <div className="flex flex-col h-[calc(100vh-12rem)] bg-white rounded-xl shadow-sm border border-gray-200 overflow-hidden">
      {/* Header */}
      <div className="bg-slate-50 border-b border-gray-200 p-4 flex items-center justify-between">
        <div>
          <h2 className="font-semibold text-gray-800">AI Health Assistant</h2>
          <p className="text-xs text-gray-500">Always consult a real doctor for medical diagnoses.</p>
        </div>
      </div>

      {/* Messages Area */}
      <div className="flex-1 overflow-y-auto p-4 space-y-6">
        {messages.length === 0 && (
          <div className="text-center text-gray-500 mt-10">
            <Bot className="w-12 h-12 mx-auto mb-4 text-blue-300" />
            <p className="text-lg font-medium">Hello! How can I help you today?</p>
            <p className="text-sm">Describe your symptoms or ask a general health question.</p>
          </div>
        )}

        {messages.filter((m: any) => m.role !== 'system').map((m: any) => (
          <div key={m.id} className={`flex gap-4 ${m.role === "user" ? "flex-row-reverse" : "flex-row"}`}>
            <div className={`w-8 h-8 rounded-full flex items-center justify-center shrink-0 ${m.role === "user" ? "bg-teal-500 text-white" : "bg-blue-600 text-white"}`}>
              {m.role === "user" ? <User className="w-5 h-5" /> : <Bot className="w-5 h-5" />}
            </div>
            <div className={`max-w-[80%] rounded-2xl px-4 py-3 ${m.role === "user" ? "bg-teal-50 text-teal-900 rounded-tr-none" : "bg-slate-50 text-gray-800 border border-gray-100 rounded-tl-none"}`}>
              <div className="whitespace-pre-wrap prose prose-sm max-w-none">{m.content}</div>
            </div>
          </div>
        ))}
        {isLoading && (
          <div className="flex gap-4 flex-row">
            <div className="w-8 h-8 rounded-full bg-blue-600 text-white flex items-center justify-center shrink-0">
              <Bot className="w-5 h-5" />
            </div>
            <div className="bg-slate-50 border border-gray-100 rounded-2xl rounded-tl-none px-4 py-3 flex items-center gap-2">
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "0ms" }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "150ms" }}></div>
              <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" style={{ animationDelay: "300ms" }}></div>
            </div>
          </div>
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <div className="p-4 bg-white border-t border-gray-200">
        <form onSubmit={handleSubmit} className="relative flex items-end gap-2">
          <textarea
            className="w-full resize-none rounded-xl border-gray-300 focus:border-blue-500 focus:ring-blue-500 pr-12 py-3 min-h-[52px] max-h-32"
            rows={1}
            value={input}
            onChange={handleInputChange}
            placeholder="Type your message..."
            onKeyDown={(e) => {
              if (e.key === 'Enter' && !e.shiftKey) {
                e.preventDefault();
                const form = e.currentTarget.form;
                if (form) form.requestSubmit();
              }
            }}
          />
          <button 
            type="submit" 
            disabled={isLoading || !input.trim()}
            className="absolute right-2 bottom-2 p-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
          >
            <Send className="w-4 h-4" />
          </button>
        </form>
        <div className="mt-2 flex items-center gap-1 justify-center text-xs text-gray-500">
          <AlertTriangle className="w-3 h-3 text-amber-500" />
          <span>AI can make mistakes. For medical emergencies, call 911.</span>
        </div>
      </div>
    </div>
  );
}
