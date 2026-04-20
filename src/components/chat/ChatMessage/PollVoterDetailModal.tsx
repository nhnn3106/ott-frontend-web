import React, { useState, useEffect } from "react";
import { X, User as UserIcon } from "lucide-react";
import { ParticipantService } from "../../../services";
import Avatar from "../../common/Avatar";
import type { Message, PollOption } from "../../../types/message.type";

interface PollVoterDetailModalProps {
  isOpen: boolean;
  onClose: () => void;
  msg: Message;
  currentUserId?: string;
}

export const PollVoterDetailModal: React.FC<PollVoterDetailModalProps> = ({
  isOpen,
  onClose,
  msg,
  currentUserId,
}) => {
  const [activeOptionId, setActiveOptionId] = useState<string>(
    msg.poll_options?.[0]?.id || ""
  );
  const [members, setMembers] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchMembers = async () => {
      if (!isOpen || !msg.conversation_id) return;
      try {
        setLoading(true);
        const data = await ParticipantService.getConversationMembers(msg.conversation_id);
        setMembers(data || []);
      } catch (error) {
        console.error("Error fetching members:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchMembers();
  }, [isOpen, msg.conversation_id]);

  if (!isOpen) return null;

  const options = msg.poll_options || [];
  const activeOption = options.find((opt) => opt.id === activeOptionId);
  const voterIds = activeOption?.voters || [];

  // Map voter IDs to member details
  const votersWithDetails = voterIds.map(voterId => {
    const member = members.find(m => String(m.user_id) === String(voterId));
    return {
      id: voterId,
      name: member?.nickname || member?.user?.name || "Thành viên",
      avatar: member?.user?.avatar || "",
    };
  });

  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center bg-primary-900/40 animate-in fade-in duration-200 font-body p-4" onClick={onClose}>
      <div
        className="bg-surface w-full max-w-[400px] rounded-xl shadow-xl overflow-hidden animate-in zoom-in-95 duration-200 border border-primary-200/50 flex flex-col"
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header - Thu gọn padding và size chữ */}
        <div className="px-5 py-3 border-b border-primary-100 flex items-center justify-between bg-surface">
          <h3 className="text-[17px] font-bold text-primary-900 font-display">Chi tiết bình chọn</h3>
          <button
            onClick={onClose}
            className="p-1.5 rounded-full hover:bg-primary-50 outline-none focus:outline-none text-primary-500 hover:text-primary-800 transition-colors"
          >
            <X size={18} />
          </button>
        </div>

        {/* Question Summary - Loại bỏ khối màu nặng nề */}
        <div className="px-5 py-2.5 bg-primary-50/40 border-b border-primary-100/50">
          <p className="text-[14px] text-primary-800 line-clamp-2 leading-snug">
            {msg.poll_question}
          </p>
        </div>

        {/* Tabs for Options - Canh chỉnh lại khoảng cách */}
        <div className="flex border-b border-primary-100 overflow-x-auto no-scrollbar px-3 bg-surface">
          {options.map((opt) => (
            <button
              key={opt.id}
              onClick={() => setActiveOptionId(opt.id)}
              className={`px-3 py-2.5 text-[13px] font-bold whitespace-nowrap border-b-2 outline-none focus:outline-none transition-all relative font-display flex items-center gap-1.5 ${activeOptionId === opt.id
                ? "text-primary-800 border-primary-600"
                : "text-primary-500 border-transparent hover:text-primary-700 hover:bg-primary-50/50"
                }`}
            >
              <span>{opt.name}</span>
              <span className={`px-1.5 py-0.5 rounded-full text-[10px] font-body transition-colors ${activeOptionId === opt.id ? "bg-primary-100 text-primary-900" : "bg-primary-50 text-primary-500"
                }`}>
                {opt.voters?.length || 0}
              </span>
            </button>
          ))}
        </div>

        {/* Voter List - Flat list design giống Zalo/Messenger */}
        <div className="max-h-[320px] overflow-y-auto p-1.5 bg-surface custom-scrollbar">
          {loading ? (
            <div className="flex flex-col items-center justify-center py-10 gap-3">
              <div className="w-6 h-6 border-2 border-primary-300 border-t-primary-600 rounded-full animate-spin"></div>
            </div>
          ) : votersWithDetails.length > 0 ? (
            <div className="flex flex-col">
              {votersWithDetails.map((voter) => (
                <div key={voter.id} className="flex items-center gap-3 p-2.5 rounded-lg hover:bg-primary-50/60 transition-colors cursor-default">
                  <Avatar
                    src={voter.avatar}
                    name={voter.name}
                    size={36}
                  />
                  <div className="flex-1 min-w-0 flex items-center gap-2">
                    <p className="text-[14px] font-medium text-primary-900 truncate">
                      {voter.name}
                    </p>
                    {String(voter.id) === String(currentUserId) && (
                      <span className="text-[9px] bg-primary-100 text-primary-700 px-1.5 py-0.5 rounded uppercase tracking-wide font-bold">Bạn</span>
                    )}
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <div className="flex flex-col items-center justify-center py-12 text-primary-400 gap-3">
              <UserIcon size={24} className="text-primary-300" opacity={0.5} />
              <p className="text-[13px]">Chưa có lượt bình chọn</p>
            </div>
          )}
        </div>

        {/* Footer - Gọn gàng hơn */}
        <div className="px-5 py-3 bg-surface border-t border-primary-100 flex justify-end">
          <button
            onClick={onClose}
            className="px-5 py-1.5 bg-primary-600 text-surface text-[14px] rounded-lg hover:bg-primary-700 active:scale-95 outline-none focus:outline-none transition-all btn-ripple font-display"
          >
            Đóng
          </button>
        </div>
      </div>
    </div>
  );
};