import React from 'react';
import { ChatHeader } from './ChatHeader';
import { MessageBubble, type Message } from './MessageBubble';
import { ChatInput } from './ChatInput';
import { EmptyState } from './EmptyState';
import type { Conversation } from './ConversationItem';

interface ChatAreaProps {
  conversation: Conversation | null;
  messages: Message[];
  currentUserId: string;
  onSendMessage: (message: string) => void;
}

export const ChatArea: React.FC<ChatAreaProps> = ({
  conversation,
  messages,
  currentUserId,
  onSendMessage
}) => {
  if (!conversation) {
    return <EmptyState />;
  }

  return (
    <div className="flex-1 flex flex-col">
      <ChatHeader 
        conversation={conversation}
        onCall={() => console.log('Call clicked')}
        onVideoCall={() => console.log('Video call clicked')}
        onMoreOptions={() => console.log('More options clicked')}
      />
      
      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 bg-gray-50">
        {messages.map((msg) => (
          <MessageBubble
            key={msg.id}
            message={msg}
            isOwn={msg.senderId === currentUserId}
          />
        ))}
      </div>

      <ChatInput 
        onSendMessage={onSendMessage}
        onAttachFile={() => console.log('Attach file clicked')}
        onAttachImage={() => console.log('Attach image clicked')}
      />
    </div>
  );
};