import React, { useEffect, useRef, useState } from 'react';
import { Reply, Share2, Pin, RotateCcw, Trash2, CheckSquare, Info } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';

// Sử dụng chung MenuItem từ conversation context menu
import MenuItem from '../../modal/conversation/MenuItem';

interface MessageContextMenuProps {
  isOpen: boolean;
  position: { x: number; y: number };
  onClose: () => void;
  onReply?: () => void;
  onForward?: () => void;
  onPin?: () => void;
  onRevoke?: () => void;
  onDelete?: () => void;
  onVote?: () => void;
  onViewDetails?: () => void;
  isPinned?: boolean;
}

const MessageContextMenu: React.FC<MessageContextMenuProps> = ({
  isOpen,
  position,
  onClose,
  onReply,
  onForward,
  onPin,
  onRevoke,
  onDelete,
  onVote,
  onViewDetails,
  isPinned = false,
}) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      // Bỏ qua nếu click chuột phải (để xử lý onContextMenu mượt hơn)
      if (event.button === 2) return;
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (event: KeyboardEvent) => {
      if (event.key === 'Escape') {
        onClose();
      }
    };

    if (isOpen) {
      document.addEventListener('mousedown', handleClickOutside);
      document.addEventListener('keydown', handleEscape);
      // Ngăn scroll khi đang mở menu
      const handleScroll = () => onClose();
      document.addEventListener('scroll', handleScroll, true);

      return () => {
        document.removeEventListener('mousedown', handleClickOutside);
        document.removeEventListener('keydown', handleEscape);
        document.removeEventListener('scroll', handleScroll, true);
      };
    }
  }, [isOpen, onClose]);

  useEffect(() => {
    if (isOpen && menuRef.current) {
      const menuRect = menuRef.current.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = position.x;
      let y = position.y;

      if (x + menuRect.width > viewportWidth) {
        x = viewportWidth - menuRect.width - 10;
      }

      if (y + menuRect.height > viewportHeight) {
        y = viewportHeight - menuRect.height - 10;
      }

      setAdjustedPosition({ x, y });
    }
  }, [isOpen, position]);

  const menuItems = [];

  if (onReply) {
    menuItems.push({
      id: 'reply',
      icon: Reply,
      label: 'Trả lời',
      onClick: onReply,
      color: 'text-gray-700',
    });
  }

  if (onForward) {
    menuItems.push({
      id: 'forward',
      icon: Share2,
      label: 'Chuyển tiếp',
      onClick: onForward,
      color: 'text-gray-700',
    });
  }

  if (onPin) {
    menuItems.push({
      id: 'pin',
      icon: Pin,
      label: isPinned ? 'Bỏ ghim tin nhắn' : 'Ghim tin nhắn',
      onClick: onPin,
      color: 'text-gray-700',
    });
  }

  if (onRevoke) {
    menuItems.push({
      id: 'revoke',
      icon: RotateCcw,
      label: 'Thu hồi tin nhắn',
      onClick: onRevoke,
      color: 'text-red-600',
      isDanger: true,
    });
  }

  if (onDelete) {
    menuItems.push({
      id: 'delete',
      icon: Trash2,
      label: 'Xóa ở phía bạn',
      onClick: onDelete,
      color: 'text-red-600',
      isDanger: true,
    });
  }

  if (onVote) {
    menuItems.push({
      id: 'vote',
      icon: CheckSquare,
      label: 'Bình chọn',
      onClick: onVote,
      color: 'text-gray-700',
    });
  }

  if (onViewDetails) {
    menuItems.push({
      id: 'view_details',
      icon: Info,
      label: 'Xem chi tiết bình chọn',
      onClick: onViewDetails,
      color: 'text-gray-700',
    });
  }

  if (!isOpen || menuItems.length === 0) return null;

  return (
    <AnimatePresence>
      <motion.div
        ref={menuRef}
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        exit={{ opacity: 0, scale: 0.95 }}
        transition={{ duration: 0.1 }}
        className="fixed bg-white rounded-lg shadow-lg border border-gray-200 py-1.5 min-w-44 z-50 overflow-hidden"
        style={{
          left: `${adjustedPosition.x}px`,
          top: `${adjustedPosition.y}px`,
        }}
        onClick={(e) => e.stopPropagation()}
        onContextMenu={(e) => {
          e.preventDefault();
          e.stopPropagation();
        }}
      >
        {menuItems.map((item) => (
          <MenuItem
            key={item.id}
            icon={item.icon}
            label={item.label}
            onClick={() => {
              item.onClick();
              onClose();
            }}
            color={item.color}
            isDanger={item.isDanger}
          />
        ))}
      </motion.div>
    </AnimatePresence>
  );
};

export default MessageContextMenu;
