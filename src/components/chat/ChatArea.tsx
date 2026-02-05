// src/components/Chat/ChatArea.tsx
import React, { useEffect, useRef } from "react";
import { useUser } from "../../contexts/UserContext";
import { useChat } from "../../hooks/useChat";
import type { ChatAreaProps } from "../../interfaces";

// Components
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatEmpty } from "./ChatEmpty";
import { ChatMessage } from "./ChatMessage";
import { ChatNotification } from "./ChatNotification";
import { ChatTimeSeparator } from "./ChatTimeSeparator";

// Utils
// Lưu ý: Import từ file bạn đã lưu các hàm xử lý ngày tháng (index.ts hoặc dateUtils.ts)
import { shouldShowTimestamp, formatChatTimestamp } from "../../utils";

const ChatArea: React.FC<ChatAreaProps> = ({ conversation }) => {
  const { currentUser } = useUser();

  // Hook lấy tin nhắn
  const { messages, loadMessages } = useChat(conversation?._id);

  // Ref để auto scroll xuống cuối
  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Auto scroll khi có tin nhắn mới
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  return (
    <div className="flex-1 flex flex-col bg-[#F2F4F7] h-full overflow-hidden">
      {/* 1. Header */}
      <ChatHeader conversation={conversation} />

      {/* 2. Danh sách tin nhắn */}
      <div className="flex-1 p-4 gap-2 overflow-y-auto custom-scrollbar flex flex-col">
        {/* Spacer để đẩy tin nhắn xuống đáy nếu chưa đầy màn hình */}
        <div className="flex-1 min-h-0" />

        {messages.length === 0 ? (
          <ChatEmpty />
        ) : (
          messages.map((msg, index) => {
            // --- Logic tính toán cho từng tin nhắn ---
            const isSystemMsg = msg.type?.startsWith("system_");
            const isMe = msg.sender_id === currentUser?._id;

            const prevMsg = messages[index - 1];
            const nextMsg = messages[index + 1];

            const showTime = shouldShowTimestamp(
              msg.createdAt || "",
              prevMsg?.createdAt,
            );

            const nextShowTime = nextMsg
              ? shouldShowTimestamp(nextMsg.createdAt || "", msg.createdAt)
              : false;

            // Kiểm tra vị trí trong chuỗi (để bo góc)
            const isFirstInSequence =
              !prevMsg || prevMsg.sender_id !== msg.sender_id || showTime;
            const isLastInSequence =
              !nextMsg || nextMsg.sender_id !== msg.sender_id || nextShowTime;

            // Kiểm tra có hiện dòng thời gian không (> 10 phút mới hiện)
            // msg.createdAt hoặc msg.created_at tùy database của bạn
         
            return (
              <React.Fragment key={msg._id}>
                {/* A. Dòng thời gian (Separator) */}
                {showTime && (
                  <ChatTimeSeparator
                    time={formatChatTimestamp(msg.createdAt)}
                  />
                )}

                {/* B. Nội dung tin nhắn */}
                {isSystemMsg ? (
                  <ChatNotification type={msg.type} content={msg.content[0]} />
                ) : (
                  <ChatMessage
                    msg={msg}
                    isMe={isMe}
                    isFirstInSequence={isFirstInSequence}
                    isLastInSequence={isLastInSequence}
                  />
                )}
              </React.Fragment>
            );
          })
        )}

        {/* Element vô hình để scroll tới */}
        <div ref={messagesEndRef} />
      </div>

      {/* 3. Ô nhập liệu */}
      <ChatInput
        conversationId={conversation._id}
        senderId={currentUser?._id || ""}
        onSendSuccess={loadMessages}
      />
    </div>
  );
};

export default ChatArea;
