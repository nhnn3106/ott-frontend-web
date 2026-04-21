import React from 'react';
import { UserPlus, Check, X } from 'lucide-react';
import { acceptFriendRequestViaChat, rejectFriendRequestViaChat } from '../../services/social.service';

interface FriendRequestBarProps {
  relationshipId: string;
  onStatusChange: () => void;
}

export const FriendRequestBar: React.FC<FriendRequestBarProps> = ({ 
  relationshipId, 
  onStatusChange 
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleAccept = async () => {
    setLoading(true);
    const success = await acceptFriendRequestViaChat(relationshipId);
    if (success) {
      onStatusChange();
    } else {
      alert('Chấp nhận kết bạn thất bại.');
    }
    setLoading(false);
  };

  const handleReject = async () => {
    setLoading(true);
    const success = await rejectFriendRequestViaChat(relationshipId);
    if (success) {
      onStatusChange();
    } else {
      alert('Từ chối kết bạn thất bại.');
    }
    setLoading(false);
  };

  return (
    <div className="bg-primary-50 border-b border-primary-100 px-6 py-3 flex items-center justify-between animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
          <UserPlus size={18} />
        </div>
        <p className="text-sm font-medium text-gray-800">
          Người này đã gửi lời mời kết bạn đến bạn.
        </p>
      </div>
      <div className="flex items-center gap-2">
        <button
          onClick={handleReject}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-gray-600 hover:bg-white hover:shadow-sm rounded-lg transition-all"
        >
          <X size={16} />
          Từ chối
        </button>
        <button
          onClick={handleAccept}
          disabled={loading}
          className="flex items-center gap-1.5 px-4 py-1.5 text-sm font-semibold text-white bg-primary-600 hover:bg-primary-700 shadow-sm shadow-primary-500/20 rounded-lg transition-all"
        >
          <Check size={16} />
          Chấp nhận
        </button>
      </div>
    </div>
  );
};
