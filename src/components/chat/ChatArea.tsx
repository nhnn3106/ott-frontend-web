import React, { useEffect, useRef } from "react";
import { useUser } from "../../contexts/UserContext";
import { ChatInput } from "./ChatInput";
import { EmptyState } from "./EmptyState";
import { ChatHeader } from "./ChatHeader";
import type { ChatAreaProps } from "../../interfaces";
import { useChat } from "../../hooks/useChat";
import { ChatNotification } from "./ChatNotification";
import { MessageItem } from "./MessageItem";

const ChatArea: React.FC<ChatAreaProps> = ({ conversation }) => {
  const { currentUser } = useUser();
  const { messages, loadMessages } = useChat(conversation?._id);
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Tự động cuộn xuống cuối khi có tin nhắn mới
  // behavior: "auto" giúp cuộn tức thì, không bị hiệu ứng trượt gây cảm giác chậm
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  // Nếu chưa chọn hội thoại, hiện màn hình trống
  if (!conversation?._id) return <div className="flex-1 bg-[#F2F4F7]" />;

  return (
    <div className="flex-1 flex flex-col bg-[#F2F4F7] h-full overflow-hidden">
      {/* Header */}
      <ChatHeader conversation={conversation} />

      {/* Message List Area */}
      {/* LƯU Ý: Đã xóa 'justify-end' để tránh lỗi mất scroll */}
      <div className="flex-1 p-4 overflow-y-auto custom-scrollbar flex flex-col">
        {/* === MAGIC DIV === 
            Div này có tác dụng đẩy nội dung xuống đáy khi ít tin nhắn.
            Khi tin nhắn nhiều, nó tự co lại để hiện thanh scroll.
        */}
        <div className="flex-1 min-h-0" />

        {messages.length === 0 ? (
          <EmptyState />
        ) : (
          messages.map((msg, index) => {
            const isSystemMsg = msg.type?.startsWith("system_");
            const isMe = msg.sender_id === currentUser?._id;

            if (isSystemMsg) {
              return (
                <ChatNotification
                  key={msg._id || `sys-${index}`}
                  type={msg.type}
                  content={msg.content}
                />
              );
            }

            return (
              <MessageItem
                key={msg._id || `msg-${index}`}
                msg={msg}
                isMe={isMe}
              />
            );
          })
        )}

        {/* Điểm neo để scroll luôn nhảy tới đây */}
        <div ref={messagesEndRef} />
      </div>

      {/* Input Area */}
      <ChatInput
        conversationId={conversation._id}
        senderId={currentUser?._id || ""}
        // Nếu Socket của bạn đã tự update tin nhắn mới, bạn có thể bỏ dòng dưới
        // để tránh việc gọi API load lại toàn bộ danh sách gây giật màn hình.
        onSendSuccess={loadMessages}
      />
    </div>
  );
};

export default ChatArea;
