import React from 'react';
import { Phone, Video, MoreVertical } from 'lucide-react';
import type { Conversation } from './ConversationItem';

interface ChatHeaderProps {
  conversation: Conversation;
  onCall?: () => void;
  onVideoCall?: () => void;
  onMoreOptions?: () => void;
}

export const ChatHeader: React.FC<ChatHeaderProps> = ({ 
  conversation,
  onCall,
  onVideoCall,
  onMoreOptions
}) => {
  return (
    <div className="p-4 border-b border-gray-200 bg-white flex items-center justify-between">
      <div className="flex items-center gap-3">
        <div className="relative">
          <img
            src={conversation.avatar}
            alt={conversation.name}
            className="w-10 h-10 rounded-full"
          />
          {conversation.online && (
            <div className="absolute bottom-0 right-0 w-3 h-3 bg-green-500 border-2 border-white rounded-full"></div>
          )}
        </div>
        <div>
          <h2 className="font-semibold text-gray-800">{conversation.name}</h2>
          <p className="text-xs text-gray-500">
            {conversation.online ? 'Đang hoạt động' : 'Không hoạt động'}
          </p>
        </div>
      </div>

      <div className="flex items-center gap-2">
        <button 
          onClick={onCall}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Phone className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          onClick={onVideoCall}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <Video className="w-5 h-5 text-gray-600" />
        </button>
        <button 
          onClick={onMoreOptions}
          className="p-2 hover:bg-gray-100 rounded-lg transition-colors"
        >
          <MoreVertical className="w-5 h-5 text-gray-600" />
        </button>
      </div>
    </div>
  );
};