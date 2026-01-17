import React, { useState, useEffect } from 'react';
import { Search, Plus, MoreVertical } from 'lucide-react';
import ConversationList from '../conversations/ConversationList';
import LoadingSkeleton from '../common/LoadingSkeleton';
import ErrorState from '../common/ErrorState';
import CreateGroupModal from '../modals/CreateGroupModal';
import { ChatService } from '../../services/chatService';
import type { Conversation, User } from '../../types';
import type { SidebarProps } from '../../interfaces';

const Sidebar: React.FC<SidebarProps> = ({ 
  onConversationSelect, 
  selectedConversationId 
}) => {
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [searchTerm, setSearchTerm] = useState('');
  const [filteredConversations, setFilteredConversations] = useState<Conversation[]>([]);
  const [isCreateGroupModalOpen, setIsCreateGroupModalOpen] = useState(false);
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [currentUserId, setCurrentUserId] = useState<string>('');

  const loadConversations = async () => {
    try {
      setLoading(true);
      setError(null);
      
      // Load all users and conversations from database via API
      const users = await ChatService.getAllUsers();
      
      // Set first user from database as current user (creator)
      if (users.length > 0) {
        const firstUser = users[0];
        setCurrentUserId(firstUser._id);
        
        // Load conversations for first user
        const conversations = await ChatService.getUserConversations(firstUser._id);
        setConversations(conversations);
        setFilteredConversations(conversations);
      }
      
      setAvailableUsers(users);
    } catch (error) {
      console.error('Failed to load data from database:', error);
      setError('Không thể tải dữ liệu từ server');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadConversations();
  }, []);

  useEffect(() => {
    if (!searchTerm.trim()) {
      setFilteredConversations(conversations);
      return;
    }

    const filtered = conversations.filter(conversation => {
      const name = getConversationName(conversation);
      const latestMessage = conversation.latestMessage?.content || '';
      
      return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
             latestMessage.toLowerCase().includes(searchTerm.toLowerCase());
    });

    setFilteredConversations(filtered);
  }, [searchTerm, conversations]);

  const getConversationName = (conversation: Conversation): string => {
    if (conversation.name) return conversation.name;
    
    if (conversation.type === 'private' && conversation.participants.length > 0) {
      return conversation.participants[0].display_name;
    }
    
    return 'Conversation';
  };

  const handleCreateGroup = async (groupName: string, selectedUsers: User[]) => {
    try {
      // Extract user IDs from selected users
      const memberIds = selectedUsers.map(user => user._id);
      
      // Call API to create group in database
      const newGroup = await ChatService.createGroup(
        currentUserId,
        groupName,
        memberIds
      );

      // Reload conversations from database to get updated list
      await loadConversations();

      // Select the new conversation
      onConversationSelect(newGroup._id);
      
      console.log('Group created successfully in database:', newGroup);
    } catch (error) {
      console.error('Failed to create group in database:', error);
      alert('Không thể tạo nhóm. Vui lòng kiểm tra kết nối server!');
    }
  };

  const renderContent = () => {
    if (loading) {
      return <LoadingSkeleton count={6} />;
    }

    if (error) {
      return (
        <ErrorState 
          message={error}
          onRetry={loadConversations}
        />
      );
    }

    return (
      <ConversationList
        conversations={filteredConversations}
        onConversationSelect={onConversationSelect}
        selectedConversationId={selectedConversationId}
        currentUserId={currentUserId}
      />
    );
  };

  return (
    <>
      <div className="w-80 bg-white border-r border-gray-200 flex flex-col h-full">
        {/* Header */}
        <div className="p-4 border-b border-gray-100">
          <div className="flex items-center justify-between mb-4">
            <h1 className="text-xl font-semibold text-gray-900">Trò chuyện</h1>
            <div className="flex gap-2">
              <button
                onClick={() => setIsCreateGroupModalOpen(true)}
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
                title="Tạo nhóm mới"
              >
                <Plus className="w-5 h-5 text-gray-600 group-hover:text-[#AE7F53] group-hover:scale-110 transition-all" />
              </button>
              <button
                className="p-2 hover:bg-gray-100 rounded-full transition-colors duration-200 group"
                title="Tùy chọn"
              >
                <MoreVertical className="w-5 h-5 text-gray-600 group-hover:text-[#AE7F53] group-hover:scale-110 transition-all" />
              </button>
            </div>
          </div>

          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Tìm kiếm cuộc hội thoại..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="w-full pl-10 pr-4 py-3 bg-gray-50 border border-gray-200 rounded-lg
                       placeholder-gray-500 text-gray-900 text-sm
                       focus:outline-none focus:ring-2 focus:ring-[#AE7F53]/20 focus:border-[#AE7F53] focus:bg-white
                       transition-all duration-200"
              disabled={loading}
            />
          </div>
        </div>

        {/* Conversations List */}
        <div className="flex-1 overflow-hidden">
          {renderContent()}
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-100 bg-gray-50">
          <div className="text-xs text-gray-500 text-center">
            {!loading && !error && (
              <>
                {filteredConversations.length} 
                {searchTerm ? ' kết quả' : ' cuộc hội thoại'}
              </>
            )}
            {loading && 'Đang tải...'}
            {error && 'Lỗi kết nối'}
          </div>
        </div>
      </div>

      {/* Create Group Modal */}
      <CreateGroupModal
        isOpen={isCreateGroupModalOpen}
        onClose={() => setIsCreateGroupModalOpen(false)}
        onCreateGroup={handleCreateGroup}
        availableUsers={availableUsers}
      />
    </>
  );
};

export default Sidebar;