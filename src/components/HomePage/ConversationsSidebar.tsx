import React from 'react';
import { Plus } from 'lucide-react';
import { SidebarHeader } from './SidebarHeader';
import { SearchBar } from './SearchBar';
import { ConversationItem, type Conversation } from './ConversationItem';

interface ConversationsSidebarProps {
  conversations: Conversation[];
  selectedConversation: Conversation | null;
  onSelectConversation: (conversation: Conversation) => void;
  onNewChat?: () => void;
  isOpen: boolean;
  onClose: () => void;
}

export const ConversationsSidebar: React.FC<ConversationsSidebarProps> = ({
  conversations,
  selectedConversation,
  onSelectConversation,
  onNewChat,
  isOpen,
  onClose
}) => {
  return (
    <>
      {/* Sidebar */}
      <div className={`
        ${isOpen ? 'translate-x-0' : '-translate-x-full lg:translate-x-0'}
        fixed lg:relative z-30 w-full sm:w-96 h-full bg-white border-r border-gray-200 flex flex-col transition-transform duration-300
      `}>
        <SidebarHeader onMenuClick={onClose} />
        <SearchBar />

        {/* New Chat Button */}
        <div className="p-4 border-b border-gray-200">
          <button 
            onClick={onNewChat}
            className="w-full flex items-center justify-center gap-2 py-2.5 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <Plus className="w-5 h-5" />
            <span>Cuộc trò chuyện mới</span>
          </button>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-y-auto">
          {conversations.map((conv) => (
            <ConversationItem
              key={conv.id}
              conversation={conv}
              isActive={selectedConversation?.id === conv.id}
              onClick={() => onSelectConversation(conv)}
            />
          ))}
        </div>
      </div>

      {/* Overlay for mobile */}
      {isOpen && (
        <div 
          className="fixed inset-0 bg-black bg-opacity-50 z-20 lg:hidden"
          onClick={onClose}
        />
      )}
    </>
  );
};