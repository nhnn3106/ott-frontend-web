// src/components/Chat/ChatHeader.tsx
import React, { useEffect } from "react";
import { Phone, Video, PanelRightOpen, PanelRightClose } from "lucide-react";
import Avatar from "../common/Avatar";
import type { ChatAreaProps } from "../../interfaces";
import {
  getConversationDisplayAvatar,
  getConversationDisplayName,
} from "../../utils";
import { usePresence } from "../../contexts/PresenceContext";
import type { Conversation } from "../../types";

interface ChatHeaderProps extends ChatAreaProps {
  onStartVoiceCall?: () => void;
  onStartVideoCall?: () => void;
  disableCallActions?: boolean;
  currentUserId?: string;
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
  hideCallActions?: boolean;
}

// ─── Helper: format last seen ────────────────────────────────────────────────
const formatLastSeen = (date: Date | null): string => {
  if (!date) return "Ngoại tuyến";
  const now = new Date();
  const diff = Math.floor((now.getTime() - date.getTime()) / 1000);

  if (diff < 60) return "Vừa mới truy cập";
  if (diff < 3600) return `Hoạt động ${Math.floor(diff / 60)} phút trước`;
  if (diff < 86400) return `Hoạt động ${Math.floor(diff / 3600)} giờ trước`;
  
  const yesterday = new Date(now);
  yesterday.setDate(yesterday.getDate() - 1);
  if (
    date.getDate() === yesterday.getDate() &&
    date.getMonth() === yesterday.getMonth() &&
    date.getFullYear() === yesterday.getFullYear()
  ) {
    return "Hoạt động hôm qua";
  }

  return `Hoạt động ${date.toLocaleDateString("vi-VN", { day: "2-digit", month: "2-digit" })}`;
};

// ─── Helper: lấy userId của người kia trong 1-1 chat ────────────────────────
const getOtherUserId = (conversation: Conversation, currentUserId?: string): string | null => {
  if (conversation.type !== "private") return null;
  const participants = conversation.participants ?? [];
  const other = participants.find(
    (p: any) => String(p.user_id ?? p._id) !== String(currentUserId)
  );
  return other ? String(other.user_id ?? other._id) : null;
};

export const ChatHeader: React.FC<ChatHeaderProps> = ({
  conversation,
  onStartVoiceCall,
  onStartVideoCall,
  disableCallActions = false,
  currentUserId,
  isSidebarOpen = false,
  onToggleSidebar,
  hideCallActions = false,
}) => {
  const { isUserOnline, getLastSeen, watchUsers } = usePresence();

  const getConversationName = (): string =>
    getConversationDisplayName(conversation, currentUserId);

  const getConversationAvatar = (): string | undefined =>
    getConversationDisplayAvatar(conversation, currentUserId);

  // Xác định userId của người kia (chỉ 1-1)
  const otherUserId = getOtherUserId(conversation, currentUserId);

  // Đăng ký theo dõi presence khi conversation thay đổi
  useEffect(() => {
    if (otherUserId) {
      watchUsers([otherUserId]);
    }
    // Với group, có thể watch tất cả members
    if (conversation.type === "group" && conversation.participants) {
      const ids = (conversation.participants as any[])
        .map((p: any) => String(p.user_id ?? p._id))
        .filter(Boolean);
      if (ids.length > 0) watchUsers(ids);
    }
  }, [otherUserId, conversation._id, watchUsers]);

  // ─── Tính trạng thái hiển thị ────────────────────────────────────────────
  let statusDot = false;
  let statusText = "";

  if (conversation.type === "private" && otherUserId) {
    statusDot = isUserOnline(otherUserId);
    if (statusDot) {
      statusText = "Đang hoạt động";
    } else {
      const lastSeen = getLastSeen(otherUserId);
      statusText = formatLastSeen(lastSeen);
    }
  } else if (conversation.type === "group") {
    // Với nhóm: đếm số thành viên đang online
    const participants = (conversation.participants ?? []) as any[];
    const onlineCount = participants.filter((p: any) =>
      isUserOnline(String(p.user_id ?? p._id))
    ).length;
    statusDot = onlineCount > 0;
    statusText = onlineCount > 0
      ? `${onlineCount} thành viên đang hoạt động`
      : "Không có ai đang hoạt động";
  }

  return (
    <div className="relative flex-none z-10">
      <div className="px-6 py-3 bg-white border-b border-gray-100 shadow-sm flex items-center justify-between">
        {/* Left Section: Avatar & Info */}
        <div className="flex items-center gap-4">
          <Avatar
            src={getConversationAvatar()}
            name={getConversationName()}
            size={48}
            className="ring-2 ring-white shadow-sm"
          />
          <div>
            <h2 className="font-bold text-gray-800 text-lg line-clamp-1">
              {getConversationName()}
            </h2>
            <div className="flex items-center gap-2">
              <span
                className={`w-2 h-2 rounded-full transition-colors duration-500 ${
                  statusDot
                    ? "bg-green-500 animate-pulse"
                    : "bg-gray-300"
                }`}
              />
              {statusText && (
                <p
                  className={`text-xs font-medium transition-colors duration-500 ${
                    statusDot ? "text-green-600" : "text-gray-500"
                  }`}
                >
                  {statusText}
                </p>
              )}
            </div>
          </div>
        </div>

        {/* Right Section: Actions */}
        <div className="flex items-center gap-1 text-gray-600">
          {!hideCallActions && (
            <>
              {/* Voice Call Button - Hidden for Groups */}
              {conversation.type !== "group" && (
                <button
                  className="p-2 hover:bg-gray-50 rounded-full transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
                  onClick={onStartVoiceCall}
                  disabled={disableCallActions}
                  title="Gọi thoại"
                >
                  <Phone size={20} />
                </button>
              )}

              {/* Video Call Button */}
              <button
                className="p-2 hover:bg-gray-50 rounded-full transition-colors disabled:opacity-40 disabled:cursor-not-allowed group relative"
                onClick={onStartVideoCall}
                disabled={disableCallActions || conversation.is_calling}
                title={conversation.is_calling ? "Đang có cuộc gọi diễn ra" : "Gọi video"}
              >
                <Video size={20} className={conversation.is_calling ? "text-gray-500" : ""} />
                {conversation.is_calling && (
                  <span className="absolute -top-1 -right-1 border-2 border-white rounded-full animate-pulse" />
                )}
              </button>

              {/* Vertical Divider */}
              <div className="w-px h-6 bg-gray-200 mx-1" />
            </>
          )}

          {/* Sidebar Toggle Button */}
          <button
            onClick={onToggleSidebar}
            className={`p-2 hover:bg-gray-50 rounded-full transition-colors cursor-pointer ${
              isSidebarOpen ? "bg-primary-50 text-primary-600" : ""
            }`}
            title={isSidebarOpen ? "Đóng thông tin" : "Mở thông tin"}
          >
            {isSidebarOpen ? (
              <PanelRightClose size={20} />
            ) : (
              <PanelRightOpen size={20} />
            )}
          </button>
        </div>
      </div>

      {/* Active Call Banner (Group Call) */}
      {conversation.type === "group" && conversation.is_calling && (
        <div className="px-6 py-2 bg-emerald-50/80 backdrop-blur-md border-b border-emerald-100 flex items-center justify-between animate-in slide-in-from-top duration-300">
          <div className="flex items-center gap-3">
            <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-white shadow-sm shadow-emerald-200">
              <Video size={16} fill="currentColor" />
            </div>
            <div className="flex flex-col">
              <p className="text-[13px] font-bold text-emerald-700">Cuộc gọi video nhóm</p>
              <p className="text-[11px] text-emerald-600/80 font-medium">
                {conversation.call_participant_count ?? 1} người đang tham gia
              </p>
            </div>
          </div>
          <button
            onClick={() => {
              if (onStartVideoCall) onStartVideoCall();
            }}
            className="px-4 py-1.5 bg-emerald-500 hover:bg-emerald-600 text-white text-[13px] font-bold rounded-xl transition-all shadow-sm active:scale-95"
          >
            Tham gia
          </button>
        </div>
      )}
    </div>
  );
};
