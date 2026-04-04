import React from 'react';

export interface Conversation {
  id: string;
  name: string;
  avatar: string;
  lastMessage: string;
  time: string;
  unread: number;
  online: boolean;
  isGroup?: boolean;
}

interface ConversationItemProps {
  conversation: Conversation;
  isActive: boolean;
  onClick: () => void;
}

export const ConversationItem: React.FC<ConversationItemProps> = ({ 
  conversation, 
  isActive, 
  onClick 
}) => {
  return (
    <button
      onClick={onClick}
      className={`w-full p-4 flex items-center gap-3 hover:bg-gray-50 transition-colors ${
        isActive ? 'bg-blue-50 border-l-4 border-blue-600' : ''
      }`}
    >
      <div className="relative flex-shrink-0">
        <img
          src={conversation.avatar}
          alt={conversation.name}
          className="w-12 h-12 rounded-full"
        />
        {conversation.online && (
          <div className="absolute bottom-0 right-0 w-3.5 h-3.5 bg-green-500 border-2 border-white rounded-full"></div>
        )}
      </div>

      <div className="flex-1 min-w-0 text-left">
        <div className="flex items-center justify-between mb-1">
          <h3 className="font-semibold text-gray-800 truncate">
            {conversation.name}
          </h3>
          <span className="text-xs text-gray-500 flex-shrink-0 ml-2">
            {conversation.time}
          </span>
        </div>
        <div className="flex items-center justify-between">
          <p className="text-sm text-gray-600 truncate flex-1">
            {conversation.lastMessage}
          </p>
          {conversation.unread > 0 && (
            <span className="ml-2 px-2 py-0.5 bg-blue-600 text-white text-xs rounded-full flex-shrink-0">
              {conversation.unread}
            </span>
          )}
        </div>
      </div>
    </button>
  );
};