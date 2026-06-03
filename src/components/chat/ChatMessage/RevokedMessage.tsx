import { MessageLayout } from "./MessageLayout";
import type { ConversationParticipant, Message } from "../../../types";

const getFirstContentText = (msg: Message) => {
  const firstContent = Array.isArray(msg.content) ? msg.content[0] : msg.content;
  return typeof firstContent === "string"
    ? firstContent
    : firstContent && typeof firstContent === "object"
      ? String((firstContent as any).text || (firstContent as any).url || (firstContent as any).name || "")
      : "";
};

const normalizePlaceholderText = (value: unknown) =>
  String(value || "")
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .toLowerCase();

const hasRevokedPlaceholderContent = (msg: Message) =>
  normalizePlaceholderText(getFirstContentText(msg)).includes("tin nhan da duoc thu hoi");

export const RevokedMessage = ({
  msg,
  isMe,
  currentUserId,
  isFirstInSequence,
  isLastInSequence,
  isTopBoundary,
  onDelete,
  participants,
  conversationType,
}: {
  msg: Message;
  isMe: boolean;
  currentUserId?: string;
  isFirstInSequence: boolean;
  isLastInSequence: boolean;
  isTopBoundary?: boolean;
  onDelete?: (msg: Message) => void;
  participants?: ConversationParticipant[];
  conversationType?: string;
}) => {
  const isModerationRejected = msg.system_meta?.moderation_status === "rejected";
  const shouldShowModerationViolation =
    isModerationRejected && !hasRevokedPlaceholderContent(msg);
  const placeholder = shouldShowModerationViolation
    ? "Tin nhắn đã bị ẩn do vi phạm tiêu chuẩn cộng đồng"
    : "Tin nhắn đã được thu hồi";

  const placeholderMessage = {
    ...msg,
    type: "text",
    content: [placeholder],
    reply_to: null,
    reply_to_msg_id: null,
    reactions: [],
    is_revoked: true,
  } as unknown as Message;

  return (
    <MessageLayout
      msg={placeholderMessage}
      isMe={isMe}
      currentUserId={currentUserId}
      isFirst={isFirstInSequence}
      isLast={isLastInSequence}
      isTopBoundary={isTopBoundary}
      onDelete={onDelete}
      participants={participants}
      conversationType={conversationType}
    >
      {(borderRadius, renderMessageMeta) => (
        <div
          className={`min-h-10 px-3 py-2 text-[13px] leading-relaxed shadow-sm overflow-hidden ${borderRadius} ${
            shouldShowModerationViolation
              ? "bg-red-50 border-red-200 text-red-700"
              : isMe
                ? "bg-[#e8e8e8] border-[#d7c7af] text-[#7b6648]"
                : "bg-gray-200 border-slate-300 text-slate-500"
          }`}
        >
          <span className="italic">{placeholder}</span>
          {renderMessageMeta() && (
            <div className={`mt-1 flex ${isMe ? "justify-end" : "justify-start"}`}>
              {renderMessageMeta()}
            </div>
          )}
        </div>
      )}
    </MessageLayout>
  );
};
