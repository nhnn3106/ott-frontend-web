import React, { useState } from "react";
import type { Message } from "../../../types/message.type";
import { MessageService } from "../../../services";
import { ListChecks, CheckCircle2 } from "lucide-react";

import { MessageLayout } from "./MessageLayout";
import { PollVoterDetailModal } from "./PollVoterDetailModal";

interface PollMessageProps {
  msg: Message;
  isMe: boolean;
  currentUserId?: string;
  isFirstInSequence: boolean;
  isLastInSequence: boolean;
  isTopBoundary?: boolean;
  onReply?: (msg: Message) => void;
  onReact?: (msg: Message, reactionType: string) => void;
  onRevoke?: (msg: Message) => void;
  onDelete?: (msg: Message) => void;
  onPin?: (msg: Message) => void;
  onForward?: (msg: Message) => void;
  participants?: any[];
  conversationType?: string;
}

export const PollMessage: React.FC<PollMessageProps> = ({
  msg,
  isMe,
  currentUserId,
  isFirstInSequence,
  isLastInSequence,
  isTopBoundary,
  onPin,
  participants,
  conversationType,
}) => {
  const [isVoting, setIsVoting] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);

  // Fallback for missing properties
  const question = msg.poll_question || "Khảo sát";
  const options = msg.poll_options || [];
  const totalVotes = options.reduce((sum, opt) => sum + (opt.voters?.length || 0), 0);

  const handleVote = async (optionId: string) => {
    if (isVoting || !msg.msg_id || !msg.conversation_id || !currentUserId) return;

    try {
      setIsVoting(true);

      const isCurrentlySelected = options.find(opt => opt.id === optionId)?.voters?.includes(currentUserId);

      // Compute new optionIds list based on multipleChoice
      let newOptionIds: string[] = [];
      if (msg.poll_multiple_choice) {
        // Collect currently selected options
        options.forEach(opt => {
          if (opt.voters?.includes(currentUserId as string)) {
            newOptionIds.push(opt.id);
          }
        });

        // Toggle the clicked one
        if (isCurrentlySelected) {
          newOptionIds = newOptionIds.filter(id => id !== optionId);
        } else {
          newOptionIds.push(optionId);
        }
      } else {
        // Single choice, just toggle if clicked the same, otherwise select only the new one
        if (!isCurrentlySelected) {
          newOptionIds = [optionId];
        }
      }

      await MessageService.votePoll(
        msg.conversation_id,
        msg.msg_id,
        currentUserId,
        newOptionIds
      );

    } catch (error) {
      console.error("Error voting:", error);
    } finally {
      setIsVoting(false);
    }
  };

  return (
    <>
      <MessageLayout
        msg={msg}
        isMe={isMe}
        currentUserId={currentUserId}
        isFirst={isFirstInSequence}
        isLast={isLastInSequence}
        isTopBoundary={isTopBoundary}
        onPin={onPin}
        isCentered={true}
        hideAvatar={true}
        showActionsOnHover={false}
        participants={participants}
        conversationType={conversationType}
        onViewDetails={() => setIsDetailModalOpen(true)}
      >
        {(borderRadius) => (
          <div className={`w-[320px] sm:w-[380px] bg-surface  overflow-hidden shadow-md ring-1 ring-primary-900/5 ${borderRadius} flex flex-col font-body`}>
            {/* Header section with gradient background */}
            <div className="p-5 bg-[image:var(--background-image-gradient-subtle)] flex flex-col gap-2 relative">


              <div className="flex items-center gap-2 text-primary-700 font-extrabold font-display">
                <div className="bg-primary-600 text-surface p-1 rounded-md shadow-sm">
                  <ListChecks size={16} strokeWidth={3} />
                </div>
                <span className="text-[12px] uppercase tracking-[0.1em]">Bình chọn</span>
              </div>

              <h4 className="text-[18px] font-bold text-primary-900 leading-tight break-words pr-4 font-display">
                {question}
              </h4>

              <div className="flex items-center justify-between mt-1 pt-1">
                <span className="text-[11px] font-bold text-primary-700 bg-primary-100 px-2 py-0.5 rounded-full uppercase tracking-wider">
                  {msg.poll_multiple_choice ? "Chọn nhiều" : "Bình chọn một"}
                </span>
                <div className="flex items-center gap-1.5">
                  <span className="text-[13px] font-bold text-primary-700">{totalVotes}</span>
                  <span className="text-[13px] text-primary-600">lượt bình chọn</span>
                </div>
              </div>
            </div>

            {/* Options list */}
            <div className="p-4 flex flex-col gap-3 max-h-[350px] overflow-y-auto custom-scrollbar">
              {options.map((opt) => {
                const voteCount = opt.voters?.length || 0;
                const isSelected = opt.voters?.includes(currentUserId as string);
                const percentage = totalVotes > 0 ? Math.round((voteCount / totalVotes) * 100) : 0;

                return (
                  <div
                    key={opt.id}
                    onClick={() => handleVote(opt.id)}
                    className={`relative cursor-pointer group rounded-xl border transition-base active:scale-[0.98]  ${isSelected
                      ? "border-primary-400 bg-primary-50"
                      : "border-primary-100 hover:border-primary-300 hover:bg-surface-raised bg-surface"
                      }`}
                  >
                    {/* Progress Bar with subtle gradient */}
                    {percentage > 0 && (
                      <div
                        className={`absolute left-0 top-0 bottom-0 opacity-[0.15] rounded-l-lg pointer-events-none transition-all duration-700 ease-out ${isSelected ? "bg-[image:var(--background-image-gradient-primary)]" : "bg-primary-200"
                          }`}
                        style={{ width: `${percentage}%` }}
                      />
                    )}

                    <div className="relative p-3.5 flex items-center justify-between z-10">
                      <div className="flex items-center gap-3.5 flex-1 min-w-0">
                        {/* Custom indicators */}
                        <div className={`w-5.5 h-5.5 border-2 flex items-center justify-center shrink-0 transition-base ${msg.poll_multiple_choice ? "rounded-md" : "rounded-full"
                          } ${isSelected
                            ? "bg-primary-600 border-primary-600 scale-110 shadow-md shadow-primary-900/10"
                            : "border-primary-300 bg-surface group-hover:border-primary-500"
                          }`}>
                          {isSelected && <CheckCircle2 size={12} className="text-surface" strokeWidth={4} />}
                        </div>

                        <div className="flex flex-col min-w-0">
                          <span className={`text-[15px] font-bold truncate leading-tight font-display ${isSelected ? "text-primary-900" : "text-primary-800"}`}>
                            {opt.name}
                          </span>
                          {voteCount > 0 && (
                            <div className="flex items-center gap-1.5 mt-0.5">
                              <span className={`text-[11px] font-bold ${isSelected ? "text-primary-700" : "text-primary-500"}`}>
                                {voteCount}
                              </span>
                              <div className="w-1 h-1 rounded-full bg-primary-300"></div>
                              <span className={`text-[11px] font-medium ${isSelected ? "text-primary-600" : "text-primary-400"}`}>
                                {percentage}%
                              </span>
                            </div>
                          )}
                        </div>
                      </div>

                      {isSelected && (
                        <div className="flex items-center gap-1 text-primary-700 font-bold text-[10px] bg-primary-100 border border-primary-200 px-2 py-1 rounded-full shadow-sm badge-pop">
                          <span>Đã chọn</span>
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Action footer */}
            <div className="px-5 py-3.5 border-t border-primary-100 bg-surface flex items-center justify-center">
              <button
                className="text-primary-600 text-[14px] font-extrabold hover:text-primary-800 transition-base py-1.5 px-3 rounded-lg flex items-center gap-2 group btn-ripple"
                onClick={() => setIsDetailModalOpen(true)}
              >
                <span>Xem chi tiết bình chọn</span>
                <div className="w-5 h-5 rounded-full bg-primary-50 flex items-center justify-center group-hover:bg-primary-100 transition-colors">
                  <CheckCircle2 size={10} strokeWidth={3} className="text-primary-700" />
                </div>
              </button>
            </div>
          </div>
        )}
      </MessageLayout>

      <PollVoterDetailModal
        isOpen={isDetailModalOpen}
        onClose={() => setIsDetailModalOpen(false)}
        msg={msg}
        currentUserId={currentUserId}
      />
    </>
  );
};
