"use client";

import { MessageSquare, Send, Mic } from "lucide-react";
import { useState } from "react";

export default function AgentPage() {
  const [message, setMessage] = useState("");

  return (
    <div className="flex flex-col h-[calc(100vh-8rem)] lg:h-[calc(100vh-4rem)] animate-fade-in">
      {/* Header */}
      <div className="mb-4">
        <h1 className="text-h1 font-bold text-ink">AI Assistant</h1>
        <p className="text-body text-ink-light mt-1">
          Ask me anything about your properties, documents, or tenants.
        </p>
      </div>

      {/* Chat area */}
      <div className="flex-1 bg-white rounded-2xl border border-gray-100 shadow-card flex flex-col overflow-hidden">
        {/* Messages */}
        <div className="flex-1 overflow-y-auto p-4 space-y-4">
          {/* Welcome message */}
          <div className="flex gap-3">
            <div className="w-8 h-8 bg-propblue rounded-lg flex items-center justify-center flex-shrink-0">
              <MessageSquare className="w-4 h-4 text-white" />
            </div>
            <div className="bg-surface rounded-2xl rounded-tl-md px-4 py-3 max-w-[80%]">
              <p className="text-body text-ink">
                Hi! I&apos;m your PropManage assistant. I can help you with:
              </p>
              <ul className="mt-2 space-y-1 text-sm text-ink-medium">
                <li>• Finding information in your documents</li>
                <li>• Checking rent payment status</li>
                <li>• Reviewing agreement terms</li>
                <li>• Sending reminders to tenants</li>
                <li>• General property management advice</li>
              </ul>
            </div>
          </div>
        </div>

        {/* Input */}
        <div className="border-t border-gray-100 p-3">
          <div className="flex items-center gap-2">
            <button className="w-10 h-10 flex items-center justify-center text-ink-light hover:text-propblue hover:bg-propblue-light rounded-xl transition-colors">
              <Mic className="w-5 h-5" />
            </button>
            <input
              type="text"
              value={message}
              onChange={(e) => setMessage(e.target.value)}
              placeholder="Ask about your properties..."
              className="flex-1 py-2.5 px-4 bg-surface rounded-xl text-sm focus:outline-none focus:ring-2 focus:ring-propblue/20 border border-transparent focus:border-propblue"
            />
            <button
              disabled={!message.trim()}
              className="w-10 h-10 flex items-center justify-center bg-propblue text-white rounded-xl hover:bg-propblue-dark transition-colors disabled:opacity-40 disabled:cursor-not-allowed active:scale-95"
            >
              <Send className="w-5 h-5" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
