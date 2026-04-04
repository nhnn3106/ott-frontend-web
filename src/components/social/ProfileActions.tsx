import React, { useState } from "react";
import { sendFriendRequest } from "../../services/social.service";

interface ProfileActionsProps {
  isOwner: boolean;
  currentUserId: string;
  profileUserId?: string;
  onEditProfile: () => void;
}

const ProfileActions: React.FC<ProfileActionsProps> = ({
  isOwner,
  currentUserId,
  profileUserId,
  onEditProfile,
}) => {
  const [requestSent, setRequestSent] = useState(false);
  const [sending, setSending] = useState(false);

  const canSendRequest =
    !!currentUserId && !!profileUserId && currentUserId !== profileUserId;

  const handleSendRequest = async () => {
    if (!canSendRequest || sending) return;
    setSending(true);
    const ok = await sendFriendRequest(currentUserId, profileUserId!);
    if (ok) setRequestSent(true);
    setSending(false);
  };

  return (
    <div className="flex gap-2 mb-4">
      {isOwner ?
        <button
          onClick={onEditProfile}
          className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium text-sm">
          Chỉnh sửa trang cá nhân
        </button>
      : <>
          <button
            onClick={handleSendRequest}
            disabled={!canSendRequest || sending || requestSent}
            className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 disabled:bg-blue-200 transition font-medium text-sm">
            {requestSent ?
              "Đã gửi lời mời kết bạn"
            : sending ?
              "Đang gửi"
            : "Kết bạn"}
          </button>
          <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium text-sm">
            Nhắn tin
          </button>
        </>
      }
    </div>
  );
};

export default ProfileActions;
