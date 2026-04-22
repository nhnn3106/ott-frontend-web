import React, { useEffect, useState, useRef } from "react";
import { Pencil, Camera, Loader2 } from "lucide-react";
import { ConversationService, MessageService } from "../../../../services";
import Avatar from "../../../common/Avatar";
import type { GroupInfoHeaderProps } from "../../../../interfaces";
import { getConversationDisplayAvatar, getConversationDisplayName, getFullUrl } from "../../../../utils";

const GroupInfoHeader: React.FC<GroupInfoHeaderProps> = ({
  conversation,
  memberCount,
  onUpdate,
  isAdmin,
  currentUserId,
}) => {
  const [showRenameModal, setShowRenameModal] = useState(false);
  const [displayName, setDisplayName] = useState(
    getConversationDisplayName(conversation, currentUserId),
  );
  const [newName, setNewName] = useState(
    getConversationDisplayName(conversation, currentUserId),
  );
  const [isUpdating, setIsUpdating] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    const resolvedName = getConversationDisplayName(conversation, currentUserId);
    setDisplayName(resolvedName);
    if (!showRenameModal) {
      setNewName(resolvedName);
    }
  }, [conversation, currentUserId, showRenameModal]);

  const handleSave = async () => {
    const nextName = newName.trim();
    if (!nextName) return;

    setIsUpdating(true);
    try {
      await ConversationService.updateConversation(conversation._id, {
        name: nextName,
        requesterId: currentUserId,
      });

      setDisplayName(nextName);
      onUpdate({ name: nextName });
      setShowRenameModal(false);
    } catch (error) {
      console.error("Error updating conversation name:", error);
      alert("Đổi tên nhóm thất bại.");
    } finally {
      setIsUpdating(false);
    }
  };

  const handleAvatarClick = () => {
    fileInputRef.current?.click();
  };

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file || !currentUserId) return;

    setIsUpdating(true);
    try {
      // 1. Get presigned URL
      const { uploadUrl, fileUrl } = await MessageService.getPresignedUrl(file.name, file.type);
      
      // 2. Upload to S3
      await MessageService.uploadFileToS3(uploadUrl, file);
      
      console.log("Updating group avatar with new URL:", fileUrl);
      
      // 3. Update conversation
      await ConversationService.updateConversation(conversation._id, {
        avatar: fileUrl,
        requesterId: currentUserId
      });
      
      console.log("Avatar update API call successful.");
      onUpdate({ avatar: fileUrl });
    } catch (error) {
      console.error("Error updating group avatar:", error);
      alert("Cập nhật ảnh nhóm thất bại.");
    } finally {
      setIsUpdating(false);
      if (fileInputRef.current) fileInputRef.current.value = '';
    }
  };

  const isGroupChat = conversation.type === "group";

  return (
    <div className="px-4 py-8 text-center border-b border-gray-100 bg-gray-50/20">
      <div className="relative mx-auto mb-5 w-28 h-28">
        <Avatar
          src={getConversationDisplayAvatar(conversation, currentUserId)}
          name={displayName}
          size={112}
          className="ring-4 ring-white shadow-md"
        />
        {isGroupChat && (
          <button
            onClick={handleAvatarClick}
            disabled={isUpdating}
            className="absolute bottom-1 right-1 p-2 bg-white rounded-full border border-gray-100 shadow-md hover:bg-gray-50 transition-all cursor-pointer hover:scale-110 active:scale-95"
          >
            {isUpdating ? (
              <Loader2 className="h-4 w-4 animate-spin text-primary-600" />
            ) : (
              <Camera className="h-4 w-4 text-gray-600" />
            )}
          </button>
        )}
        <input
          type="file"
          ref={fileInputRef}
          onChange={handleFileChange}
          accept="image/*"
          className="hidden"
        />
      </div>

      <div className="flex items-center justify-center gap-2">
        <h3 className="text-lg font-semibold text-gray-900 truncate max-w-[200px]">
          {displayName}
        </h3>
        {isGroupChat && (
          <button
            onClick={() => {
              setNewName(displayName || "");
              setShowRenameModal(true);
            }}
            className="cursor-pointer p-1 text-gray-400 hover:text-primary-600 hover:bg-primary-50 rounded transition-colors"
          >
            <Pencil size={14} />
          </button>
        )}
      </div>

      {isGroupChat && (
        <p className="text-sm text-gray-500 mt-1">{memberCount} thành viên</p>
      )}

      {showRenameModal && (
        <div className="fixed inset-0 z-90 flex items-center justify-center bg-black/45 px-4">
          <div className="w-full max-w-130 rounded-xl bg-white shadow-2xl animate-scale-in">
            <div className="border-b border-gray-100 px-6 py-4 text-left">
              <h4 className="text-[20px] font-semibold text-gray-800">Đổi tên nhóm</h4>
            </div>

            <div className="px-6 py-6">
              <div className="mb-6 flex items-center justify-center">
                <div className="relative h-24 w-24">
                  <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 rounded-full ring-4 ring-primary-50">
                    <Avatar src={getConversationDisplayAvatar(conversation, currentUserId)} name={displayName} size={80} />
                  </div>
                </div>
              </div>

              <p className="mb-6 text-center text-[16px] text-gray-600 leading-relaxed">
                Tên nhóm mới sẽ hiển thị với tất cả thành viên trong cuộc trò chuyện.
              </p>

              <div className="relative">
                <input
                  type="text"
                  value={newName}
                  onChange={(e) => setNewName(e.target.value)}
                  className="h-12 w-full rounded-lg border border-gray-200 px-4 text-center text-[16px] text-gray-900 outline-none focus:border-primary-500 focus:ring-4 focus:ring-primary-500/10 transition-all"
                  autoFocus
                  placeholder="Nhập tên nhóm mới..."
                  onKeyDown={(e) => e.key === "Enter" && !isUpdating && handleSave()}
                />
              </div>

              <div className="mt-8 flex justify-end gap-3">
                <button
                  onClick={() => {
                    setNewName(displayName || "");
                    setShowRenameModal(false);
                  }}
                  disabled={isUpdating}
                  className="cursor-pointer rounded-lg bg-gray-100 px-6 py-2.5 text-[15px] font-semibold text-gray-700 hover:bg-gray-200 transition-colors"
                >
                  Hủy
                </button>
                <button
                  onClick={handleSave}
                  disabled={isUpdating || !newName.trim()}
                  className="cursor-pointer flex items-center gap-2 rounded-lg bg-primary-600 px-6 py-2.5 text-[15px] font-semibold text-white hover:bg-primary-700 shadow-md shadow-primary-500/20 transition-all disabled:opacity-50"
                >
                  {isUpdating && <Loader2 size={16} className="animate-spin" />}
                  Xác nhận
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default GroupInfoHeader;