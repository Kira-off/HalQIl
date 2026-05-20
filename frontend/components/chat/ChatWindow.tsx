'use client';

import { useState, useRef, useEffect } from 'react';
import { useOrderSocket } from '@/src/hooks/useOrderSocket';
import MessageBubble from './MessageBubble';

interface ChatWindowProps {
  orderId: number | string;
}

export default function ChatWindow({ orderId }: ChatWindowProps) {
  const { messages, isLoading, sendMessage } = useOrderSocket(orderId);
  const [text, setText] = useState('');
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll to bottom
  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages, isLoading]);

  const handleSend = (e: React.FormEvent) => {
    e.preventDefault();
    if (!text.trim()) return;
    sendMessage(text.trim());
    setText('');
  };

  return (
    <div className="bg-white rounded-3xl border border-gray-150 shadow-sm flex flex-col h-[550px] overflow-hidden">
      {/* Chat Header */}
      <div className="px-6 py-4 border-b border-gray-100 bg-indigo-50/20 flex items-center justify-between">
        <div className="flex items-center gap-2">
          <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          <h3 className="text-sm font-bold text-gray-900">Buyurtma bo&apos;yicha chat</h3>
        </div>
        <span className="text-[10px] text-gray-400 font-bold uppercase tracking-wider bg-gray-50 border border-gray-100 px-2 py-0.5 rounded-md">
          WS Realtime
        </span>
      </div>

      {/* Messages List Area */}
      <div className="flex-1 overflow-y-auto p-6 space-y-4 bg-gray-50/30 flex flex-col custom-scrollbar">
        {isLoading ? (
          <div className="flex-1 flex flex-col items-center justify-center space-y-3">
            <svg className="animate-spin h-6 w-6 text-indigo-600" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
            <p className="text-xs text-gray-400 font-medium">Xabarlar yuklanmoqda...</p>
          </div>
        ) : messages.length === 0 ? (
          <div className="flex-1 flex flex-col items-center justify-center text-center p-6 space-y-3">
            <div className="w-12 h-12 bg-indigo-50 text-indigo-500 rounded-full flex items-center justify-center mx-auto shadow-sm">
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="1.5" d="M8 12h.01M12 12h.01M16 12h.01M21 12c0 4.418-4.03 8-9 8a9.863 9.863 0 01-4.255-.949L3 20l1.395-3.72C3.512 15.042 3 13.574 3 12c0-4.418 4.03-8 9-8s9 3.582 9 8z" />
              </svg>
            </div>
            <div>
              <p className="text-sm font-bold text-gray-800">Suhbat hali boshlanmagan</p>
              <p className="text-xs text-gray-400 mt-1 max-w-xs mx-auto">
                Mutaxassis bilan tafsilotlarni kelishish uchun birinchi xabarni yozib jo&apos;nating.
              </p>
            </div>
          </div>
        ) : (
          messages.map((msg) => (
            <MessageBubble key={msg.id} message={msg} />
          ))
        )}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Message Form */}
      <form onSubmit={handleSend} className="p-4 border-t border-gray-100 bg-white flex items-center gap-3">
        <input
          type="text"
          value={text}
          onChange={(e) => setText(e.target.value)}
          placeholder="Xabar yozing..."
          className="flex-1 bg-gray-50 hover:bg-gray-100/50 focus:bg-white border border-gray-200 focus:border-indigo-500 focus:ring-2 focus:ring-indigo-100 rounded-2xl px-4 py-3 text-sm text-gray-800 placeholder-gray-400 focus:outline-none transition duration-150"
        />
        <button
          type="submit"
          disabled={!text.trim()}
          className="bg-indigo-600 hover:bg-indigo-700 disabled:bg-gray-100 disabled:text-gray-400 text-white font-bold p-3 rounded-2xl shadow-sm transition duration-150 shrink-0 flex items-center justify-center"
        >
          <svg className="w-5 h-5 transform rotate-90" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.0" d="M12 19l9 2-9-18-9 18 9-2zm0 0v-8" />
          </svg>
        </button>
      </form>
    </div>
  );
}
