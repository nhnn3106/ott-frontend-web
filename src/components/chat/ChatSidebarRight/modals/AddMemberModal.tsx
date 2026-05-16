import React, { useState, useEffect } from "react";
import { X, Search, Loader2 } from "lucide-react";
import { useAuth } from "../../../../contexts/AuthContext";
import { ConversationService, fetchFriends, MessageService } from "../../../../services";
import { useConversations } from "../../../../contexts/ConversationsContext";
import Avatar from "../../../common/Avatar";
import type { User } from "../../../../types";
import { UserService } from "../../../../services/user.service";
import type { AddMemberModalProps } from "../../../../interfaces";
import { getFullUrl } from "../../../../utils";
import { useToast } from "../../../../contexts/ToastContext";



const AddMemberModal: React.FC<AddMemberModalProps> = ({
  isOpen,
  onClose,
  conversationId,
  currentMembers,
  onMembersAdded,
}) => {
  const { user: currentUser } = useAuth();
  const { showToast } = useToast();
  const { conversations } = useConversations();
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedUsers, setSelectedUsers] = useState<Set<string>>(new Set());
  const [availableUsers, setAvailableUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(false);
  const [inviteLink, setInviteLink] = useState("");
  const [phoneSearchUser, setPhoneSearchUser] = useState<User | null>(null);
  const [phoneSearching, setPhoneSearching] = useState(false);

  useEffect(() => {
    const loadFriends = async () => {
      if (!currentUser?.id) return;
      try {
        setLoading(true);
        const friends = await fetchFriends(currentUser.id);
        const currentMemberIds = new Set(currentMembers.map((m) => m.user_id));
        const mapped: User[] = (friends || [])
          .filter((f) => !currentMemberIds.has(f.id))
          .map((f) => ({
            user_id: f.id,
            _id: f.id,
            name: f.name,
            display_name: f.name,
            avatar: f.avatarUrl || "",
            phone: f.phone || "",
          } as User));
        setAvailableUsers(mapped);
      } catch (error) {
        console.error("AddMemberModal: Error loading friends:", error);
      } finally {
        setLoading(false);
      }
    };

    if (isOpen && currentUser?.id) {
      loadFriends();
    }
  }, [isOpen, currentUser?.id, currentMembers]);

  // Automatic phone search when searchTerm looks like a phone number
  useEffect(() => {
    const isPhone = /^[0-9]{10,11}$/.test(searchTerm.trim());
    if (isPhone) {
      const timer = setTimeout(() => {
        handleSearchPhone();
      }, 500);
      return () => clearTimeout(timer);
    } else {
      setPhoneSearchUser(null);
    }
  }, [searchTerm]);

  useEffect(() => {
    const fetchInviteLink = async () => {
      if (!currentUser?.id || !conversationId || inviteLink) return;
      try {
        const link = await ConversationService.getInviteLink(conversationId, currentUser.id);
        setInviteLink(link);
      } catch {
        setInviteLink(`${window.location.origin}/join?token=${conversationId}`);
      }
    };

    if (isOpen) {
      fetchInviteLink();
    }
  }, [isOpen, conversationId, currentUser?.id, inviteLink]);



  const filteredFriends = availableUsers.filter((user) => {
    const name = user.display_name || user.name || "";
    return name.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (user.phone && user.phone.includes(searchTerm));
  });

  const handleSearchPhone = async () => {
    if (!searchTerm || searchTerm.length < 9) return;
    setPhoneSearching(true);
    setPhoneSearchUser(null);
    try {
      const user = await UserService.getUserByPhone(searchTerm);
      if (user && !currentMembers.some((m) => m.user_id === user.user_id)) {
        setPhoneSearchUser({
          ...user,
          user_id: user.user_id,
          _id: user.user_id,
          display_name: user.name,
        } as User);
      }
    } catch {
      // not found
    } finally {
      setPhoneSearching(false);
    }
  };

  const handleToggleUser = (userId: string) => {
    const next = new Set(selectedUsers);
    if (next.has(userId)) next.delete(userId);
    else next.add(userId);
    setSelectedUsers(next);
  };

  const handleAddFriends = async () => {
    if (selectedUsers.size === 0) return;
    setLoading(true);
    try {
      const allSelectedIds = Array.from(selectedUsers);
      const friendIds = allSelectedIds.filter(id => availableUsers.some(u => (u.user_id || u._id) === id));
      const strangerIds = allSelectedIds.filter(id => !availableUsers.some(u => (u.user_id || u._id) === id));

      if (friendIds.length > 0) {
        const result = await ConversationService.addMembers(conversationId, friendIds, currentUser?.id || "");
        onMembersAdded(result.members || []);
      }

      if (strangerIds.length > 0) {
        let currentLink = inviteLink;
        if (!currentLink) {
          currentLink = await ConversationService.getInviteLink(conversationId, currentUser?.id || "");
          setInviteLink(currentLink);
        }
        const linkToSend = currentLink || `${window.location.origin}/join?token=${conversationId}`;

        for (const strangerId of strangerIds) {
          // 1. Try to find existing private conversation in local list first
          const existingConv = conversations.find(c => 
            c.conversation.type === "private" && 
            c.conversation.participants?.some(p => String(p.user_id || (p as any)._id) === String(strangerId))
          );

          let targetConvId: string;
          if (existingConv) {
            targetConvId = existingConv.conversation._id;
          } else {
            const directConv = await ConversationService.getOrCreatePrivateConversation(currentUser!.id, strangerId);
            targetConvId = (directConv as any).conversation?._id || (directConv as any)._id;
          }

          await MessageService.sendMessage(
            targetConvId,
            currentUser!.id,
            linkToSend,
            "link"
          );
        }
      }

      onClose();
      setSelectedUsers(new Set());
      setSearchTerm("");
      setPhoneSearchUser(null);
      
      if (strangerIds.length > 0 && friendIds.length === 0) {
        showToast(`Đã gửi link mời tham gia nhóm`, "success");
      } else {
        showToast(`Đã thêm thành viên thành công`, "success");
      }
    } catch (error) {
      showToast(error instanceof Error ? error.message : "Có lỗi xảy ra", "error");
    } finally {
      setLoading(false);
    }
  };



  const handleClose = () => {
    onClose();
    setSearchTerm("");
    setPhoneSearchUser(null);
    setSelectedUsers(new Set());
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 animate-fade-in">
      <div className="bg-white rounded-2xl w-full max-w-md mx-4 flex flex-col max-h-[75vh] shadow-2xl animate-scale-in">
        {/* Header */}
        <div className="flex items-center justify-between px-6 py-4 border-b border-gray-100">
          <h2 className="text-lg font-semibold text-gray-900">Thêm thành viên</h2>
          <button onClick={handleClose} className="cursor-pointer p-1.5 hover:bg-gray-100 rounded-full transition-colors">
            <X className="w-5 h-5 text-gray-500" />
          </button>
        </div>



        {/* --- Tab: Bạn bè --- */}

        <>
          <div className="px-6 py-3">
            <div className="relative">
              <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                placeholder="Tìm tên hoặc số điện thoại..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="h-10 w-full rounded-xl border border-gray-200 bg-gray-50 pl-9 pr-3 text-sm text-gray-800 outline-none focus:border-primary-400 focus:bg-white focus:ring-4 focus:ring-primary-500/10"
              />
            </div>
          </div>

          <div className="flex-1 overflow-y-auto custom-scrollbar px-6 py-1">
            {loading ? (
              <div className="flex items-center justify-center py-10">
                <Loader2 size={24} className="animate-spin text-primary-500" />
              </div>
            ) : filteredFriends.length === 0 && !phoneSearchUser && !phoneSearching ? (
              <div className="py-10 text-center">
                <p className="text-sm text-gray-400 mb-4">
                  {searchTerm ? "Không tìm thấy người dùng phù hợp" : "Bắt đầu tìm kiếm thành viên..."}
                </p>
              </div>
            ) : (
              <div className="space-y-1">
                {/* Friend results */}
                {filteredFriends.map((user) => {
                  const userId = user.user_id || user._id;
                  if (!userId) return null;
                  return (
                    <div
                      key={userId}
                      onClick={() => handleToggleUser(userId)}
                      className="flex items-center gap-3 p-2.5 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors"
                    >
                      <input
                        type="checkbox"
                        checked={selectedUsers.has(userId)}
                        readOnly
                        className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                      />
                      <Avatar src={getFullUrl(user.avatar || "")} name={user.name} size={38} />
                      <div className="flex-1 min-w-0">
                        <p className="font-medium text-sm text-gray-900 truncate">{user.display_name || user.name}</p>
                      </div>
                    </div>
                  );
                })}

                {/* Phone search result (Stranger or Friend found by phone) */}
                {phoneSearchUser && (
                  <div
                    onClick={() => handleToggleUser(phoneSearchUser.user_id as string)}
                    className="flex items-center gap-3 p-2.5 mt-2 hover:bg-gray-50 rounded-xl cursor-pointer transition-colors border border-primary-100 bg-primary-50/30"
                  >
                    <input
                      type="checkbox"
                      checked={selectedUsers.has(phoneSearchUser.user_id as string)}
                      readOnly
                      className="w-4 h-4 rounded border-gray-300 text-primary-600 focus:ring-primary-500"
                    />
                    <Avatar src={getFullUrl(phoneSearchUser.avatar || "")} name={phoneSearchUser.name} size={38} />
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm text-gray-900 truncate">{phoneSearchUser.display_name || phoneSearchUser.name}</p>
                      <p className="text-xs text-gray-500">
                        {availableUsers.some(u => (u.user_id || u._id) === phoneSearchUser.user_id) ? "Bạn bè" : "Người lạ"}
                      </p>
                    </div>
                  </div>
                )}

                {phoneSearching && (
                  <div className="flex items-center justify-center py-4">
                    <Loader2 size={16} className="animate-spin text-primary-500 mr-2" />
                    <span className="text-xs text-gray-500">Đang tìm kiếm theo số điện thoại...</span>
                  </div>
                )}
              </div>
            )}
          </div>

          <div className="flex items-center justify-between px-6 py-4 border-t border-gray-100 bg-gray-50/50 rounded-b-2xl">
            <div className="text-sm font-medium text-primary-700">
              {selectedUsers.size > 0 ? `Đã chọn ${selectedUsers.size} người` : ""}
            </div>
            <div className="flex gap-2">
              <button onClick={handleClose} className="cursor-pointer px-4 py-2 text-sm font-semibold text-gray-600 hover:bg-gray-200 rounded-lg transition-colors">
                Hủy
              </button>
              <button
                onClick={handleAddFriends}
                disabled={selectedUsers.size === 0 || loading}
                className="cursor-pointer flex items-center gap-2 px-6 py-2 bg-primary-600 text-white text-sm font-semibold rounded-lg hover:bg-primary-700 shadow-md shadow-primary-500/20 disabled:bg-gray-300 disabled:shadow-none disabled:cursor-not-allowed transition-all"
              >
                {loading ? "Đang xử lý..." : "Thêm vào nhóm"}
              </button>
            </div>
          </div>
        </>
      </div>
    </div>
  );
};

export default AddMemberModal;
