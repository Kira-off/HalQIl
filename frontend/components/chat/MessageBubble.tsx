'use client';

import { Message } from '@/src/types';
import { useAppStore } from '@/src/store/useAppStore';
import OptimizedImage from '@/components/common/OptimizedImage';

interface MessageBubbleProps {
  message: Message;
}

export default function MessageBubble({ message }: MessageBubbleProps) {
  const { user } = useAppStore();

  const isMe = message.sender.id === user?.id;
  const initials = `${message.sender.first_name[0] || ''}${message.sender.last_name ? message.sender.last_name[0] : ''}`.toUpperCase();

  // Format time (e.g. 14:32)
  const formatTime = (isoString: string) => {
    try {
      const date = new Date(isoString);
      return date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: false });
    } catch {
      return '';
    }
  };

  return (
    <div className={`flex gap-3 max-w-[80%] ${isMe ? 'self-end flex-row-reverse' : 'self-start'}`}>
      {/* Avatar / Initials */}
      <div className="w-8 h-8 rounded-full shrink-0 flex items-center justify-center text-xs font-black select-none shadow-sm bg-gradient-to-tr from-gray-100 to-gray-200 text-gray-600 border border-gray-100">
        {message.sender.avatar ? (
          <OptimizedImage
            src={message.sender.avatar}
            alt={message.sender.first_name}
            width={32}
            height={32}
            className="w-full h-full rounded-full object-cover"
          />
        ) : (
          <span>{initials}</span>
        )}
      </div>

      {/* Bubble Content */}
      <div className="space-y-1">
        {/* Sender Name */}
        {!isMe && (
          <p className="text-[10px] text-gray-400 font-bold px-1">
            {message.sender.first_name} {message.sender.last_name || ''}
          </p>
        )}
        
        <div
          className={`px-4 py-3 rounded-2xl text-sm leading-relaxed shadow-sm relative ${
            isMe
              ? 'bg-gradient-to-r from-violet-600 to-indigo-600 text-white rounded-tr-none'
              : 'bg-white text-gray-800 border border-gray-100 rounded-tl-none'
          }`}
        >
          <p className="whitespace-pre-wrap break-words">{message.content}</p>
          
          {/* Time & Read Status */}
          <div className="flex items-center justify-end gap-1 mt-1 text-[9px] opacity-70">
            <span>{formatTime(message.created_at)}</span>
            {isMe && (
              <span className="text-[10px]">
                {message.is_read ? '✓✓' : '✓'}
              </span>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
