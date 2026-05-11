import React from 'react';
import { Users, Check, X } from 'lucide-react';
import { ParticipantService } from '../../services';

interface GroupInvitationBarProps {
  conversationId: string;
  userId: string;
  onStatusChange: () => void;
}

export const GroupInvitationBar: React.FC<GroupInvitationBarProps> = ({ 
  conversationId, 
  userId,
  onStatusChange 
}) => {
  const [loading, setLoading] = React.useState(false);

  const handleAccept = async () => {
    setLoading(true);
    try {
      await ParticipantService.acceptGroupInvitation(conversationId, userId);
      onStatusChange();
    } catch (error) {
      console.error('Accept group invitation failed', error);
      alert('Không thể chấp nhận lời mời tham gia nhóm.');
    } finally {
      setLoading(false);
    }
  };

  const handleReject = async () => {
    setLoading(true);
    try {
      await ParticipantService.rejectGroupInvitation(conversationId, userId);
      onStatusChange();
    } catch (error) {
      console.error('Reject group invitation failed', error);
      alert('Không thể từ chối lời mời tham gia nhóm.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-primary-50 border-b border-primary-100 px-6 py-3 flex items-center justify-between animate-in slide-in-from-top duration-300">
      <div className="flex items-center gap-3">
        <div className="w-8 h-8 bg-primary-100 rounded-full flex items-center justify-center text-primary-600">
          <Users size={18} />
        </div>
        <p className="text-sm font-medium text-gray-800">
          Bạn được mời tham gia nhóm này.
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
