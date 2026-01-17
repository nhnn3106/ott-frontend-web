import React, { useState } from 'react';
import { X, Search, Users as UsersIcon } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import Avatar from '../common/Avatar';
import type { User } from '../../types';

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onCreateGroup: (name: string, selectedUsers: User[]) => void;
  availableUsers: User[];
}

type FilterType = 'all' | 'customer' | 'family' | 'work' | 'friends' | 'later';

const CreateGroupModal: React.FC<CreateGroupModalProps> = ({
  isOpen,
  onClose,
  onCreateGroup,
  availableUsers
}) => {
  const [groupName, setGroupName] = useState('');
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [activeFilter, setActiveFilter] = useState<FilterType>('all');

  const filters = [
    { id: 'all' as FilterType, label: 'Tất cả' },
    { id: 'customer' as FilterType, label: 'Khách hàng' },
    { id: 'family' as FilterType, label: 'Gia đình' },
    { id: 'work' as FilterType, label: 'Công việc' },
    { id: 'friends' as FilterType, label: 'Bạn bè' },
    { id: 'later' as FilterType, label: 'Trả lời sau' }
  ];

  const filteredUsers = availableUsers.filter(user => {
    const matchesSearch = user.display_name.toLowerCase().includes(searchTerm.toLowerCase());
    // In real app, you would filter by category here
    return matchesSearch;
  });

  const handleToggleUser = (userId: string) => {
    const newSelected = new Set(selectedUsers);
    if (newSelected.has(userId)) {
      newSelected.delete(userId);
    } else {
      newSelected.add(userId);
    }
    setSelectedUsers(newSelected);
  };

  const handleCreate = () => {
    if (!groupName.trim()) {
      alert('Vui lòng nhập tên nhóm');
      return;
    }
    if (selectedUsers.size === 0) {
      alert('Vui lòng chọn ít nhất một thành viên');
      return;
    }

    const selected = availableUsers.filter(user => selectedUsers.has(user._id));
    onCreateGroup(groupName, selected);
    handleClose();
  };

  const handleClose = () => {
    setGroupName('');
    setSearchTerm('');
    setSelectedUsers(new Set());
    setActiveFilter('all');
    onClose();
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          transition={{ duration: 0.2 }}
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50"
          onClick={handleClose}
        >
          <motion.div
            initial={{ scale: 0.95, opacity: 0, y: 20 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 20 }}
            transition={{ duration: 0.2, ease: 'easeOut' }}
            onClick={(e) => e.stopPropagation()}
            className="bg-white rounded-2xl w-full max-w-xl mx-4 flex flex-col max-h-[80vh]"
          >
            {/* Header */}
            <div className="flex items-center justify-between px-6 py-4 border-b border-gray-200">
              <h2 className="text-xl font-semibold text-gray-900">Tạo nhóm</h2>
              <button
                onClick={handleClose}
                className="p-1 hover:bg-gray-100 rounded-full transition-colors"
              >
                <X className="w-6 h-6 text-gray-500" />
              </button>
            </div>

            {/* Content */}
            <div className="flex-1 overflow-y-auto px-6 py-4">
              {/* Group Name Input */}
              <div className="flex items-center gap-3 mb-4">
                <div className="w-12 h-12 bg-gray-200 rounded-full flex items-center justify-center">
                  <UsersIcon className="w-6 h-6 text-gray-500" />
                </div>
                <input
                  type="text"
                  placeholder="Nhập tên nhóm..."
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="flex-1 px-4 py-3 bg-transparent border-b-2 border-gray-200 
                           focus:border-[#AE7F53] focus:outline-none transition-colors
                           text-gray-900 placeholder-gray-400"
                  autoFocus
                />
              </div>

              {/* Search Input */}
              <div className="relative mb-4">
                <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                <input
                  type="text"
                  placeholder="Nhập tên, số điện thoại, hoặc danh sách số điện thoại"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="w-full pl-12 pr-4 py-3 bg-gray-50 rounded-full
                           border border-gray-200 focus:border-[#AE7F53] focus:outline-none
                           text-gray-900 placeholder-gray-400 text-sm transition-colors"
                />
              </div>

              {/* Filters */}
              <div className="flex gap-2 mb-6 overflow-x-auto pb-2">
                {filters.map((filter) => (
                  <button
                    key={filter.id}
                    onClick={() => setActiveFilter(filter.id)}
                    className={`px-4 py-2 rounded-full text-sm font-medium whitespace-nowrap transition-colors
                      ${activeFilter === filter.id 
                        ? 'bg-[#AE7F53] text-white' 
                        : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                  >
                    {filter.label}
                  </button>
                ))}
              </div>

              {/* Section Title */}
              <h3 className="text-sm font-medium text-gray-500 mb-3">
                Trò chuyện gần đây
              </h3>

              {/* Users List */}
              <motion.div 
                className="space-y-1"
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.1 }}
              >
                {filteredUsers.length === 0 ? (
                  <motion.div 
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    className="text-center py-8 text-gray-400"
                  >
                    Không tìm thấy người dùng
                  </motion.div>
                ) : (
                  filteredUsers.map((user, index) => (
                    <motion.label
                      key={user._id}
                      initial={{ opacity: 0, x: -20 }}
                      animate={{ opacity: 1, x: 0 }}
                      transition={{ delay: index * 0.03, duration: 0.2 }}
                      whileHover={{ backgroundColor: 'rgba(0, 0, 0, 0.02)' }}
                      className="flex items-center gap-3 p-3 rounded-lg cursor-pointer"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(user._id)}
                        onChange={() => handleToggleUser(user._id)}
                        className="w-5 h-5 rounded border-gray-300 text-[#AE7F53] 
                                 focus:ring-2 focus:ring-[#AE7F53]/20 cursor-pointer"
                      />
                      <Avatar
                        src={user.avatar_url}
                        name={user.display_name}
                        size={40}
                        showStatus
                        status={user.status}
                      />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {user.display_name}
                        </p>
                      </div>
                    </motion.label>
                  ))
                )}
              </motion.div>
            </div>

            {/* Footer */}
            <div className="flex items-center justify-end gap-3 px-6 py-4 border-t border-gray-200">
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleClose}
                className="px-6 py-2 text-gray-700 hover:bg-gray-100 rounded-lg font-medium transition-colors"
              >
                Hủy
              </motion.button>
              <motion.button
                whileHover={{ scale: 1.02 }}
                whileTap={{ scale: 0.98 }}
                onClick={handleCreate}
                disabled={!groupName.trim() || selectedUsers.size === 0}
                className="px-6 py-2 bg-[#AE7F53] text-white rounded-lg font-medium
                         hover:bg-[#9a6d46] disabled:bg-gray-300 disabled:cursor-not-allowed
                         transition-colors"
              >
                Tạo nhóm
              </motion.button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default CreateGroupModal;
