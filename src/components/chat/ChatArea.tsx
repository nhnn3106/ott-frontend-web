// src/components/Chat/ChatArea.tsx
import React, { useEffect, useMemo, useRef, useState } from "react";
import { useUser } from "../../contexts/UserContext";
import { useConversations } from "../../contexts/ConversationsContext"; // Giữ từ bản 2
import { useChat } from "../../hooks/useChat";
import { MessageService, ParticipantService } from "../../services"; // Giữ từ bản 2
import type { ChatAreaProps } from "../../interfaces";

// Components
import { ChatHeader } from "./ChatHeader";
import { ChatInput } from "./ChatInput";
import { ChatEmpty } from "./ChatEmpty";
import { ChatMessage } from "./ChatMessage";
import { ChatNotification } from "./ChatNotification";
import { ChatTimeSeparator } from "./ChatTimeSeparator";
import ChatSidebarRight from "./ChatSidebarRight";

// Utils
import { shouldShowTimestamp, formatChatTimestamp } from "../../utils";
import { MediaViewer } from "./ChatMessage/MediaViewer";
import type { Message } from "../../types";

interface ExtendedChatAreaProps extends ChatAreaProps {
  isSidebarOpen?: boolean;
  onToggleSidebar?: () => void;
}

const ChatArea: React.FC<ExtendedChatAreaProps> = ({ 
  conversation,
  isSidebarOpen = false,
  onToggleSidebar,
}) => {
  const { currentUser } = useUser();
  const { conversations, updateParticipant } = useConversations(); // Logic "Đã xem"

  const activeConversation = useMemo(() => {
    const matched = conversations.find(
      (item) => item.conversation._id === conversation?._id,
    )?.conversation;
    return matched || conversation;
  }, [conversations, conversation]);

  const { messages, loadMessages } = useChat(
    activeConversation?._id,
    currentUser?._id,
  );

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const lastMarkedRef = useRef<string>("0"); // Logic "Đã xem"

  // --- STATE QUẢN LÝ MEDIA VIEWER (Merge cả 2 bản) ---
  const [viewerOpen, setViewerOpen] = useState(false);
  const [selectedMediaId, setSelectedMediaId] = useState<string | null>(null);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0); // Giữ từ bản 1
  const [replyToMessage, setReplyToMessage] = useState<Message | null>(null);
  
  // Sidebar state (internal if not controlled)
  const [internalSidebarOpen, setInternalSidebarOpen] = useState(false);
  const sidebarOpen = onToggleSidebar ? isSidebarOpen : internalSidebarOpen;
  const toggleSidebar = onToggleSidebar || (() => setInternalSidebarOpen(!internalSidebarOpen));

  // --- LOGIC ĐÁNH DẤU ĐÃ ĐỌC (Bản 2) ---
  useEffect(() => {
    lastMarkedRef.current = "0";
    setReplyToMessage(null);
  }, [activeConversation?._id]);

  useEffect(() => {
    if (!messages.length || !currentUser?._id || !activeConversation?._id) return;
    const lastMsg = messages[messages.length - 1];
    if (!lastMsg.msg_id) return;
    if (lastMsg.msg_id === lastMarkedRef.current) return;

    // Optimistic update
    lastMarkedRef.current = lastMsg.msg_id;
    updateParticipant(activeConversation._id, {
      last_read_message_id: lastMsg.msg_id,
    });

    // Fallback localStorage
    localStorage.setItem(
      `read_${activeConversation._id}_${currentUser._id}`,
      lastMsg.msg_id,
    );

    // Gọi API
    ParticipantService.markAsRead(
      activeConversation._id,
      currentUser._id,
      lastMsg.msg_id,
    ).catch(console.error);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [messages]);

  // --- HÀM MỞ VIEWER (Merge: nhận msgId và index) ---
  const handleOpenMedia = (msgId: string, imageIndex: number = 0) => {
    setSelectedMediaId(msgId);
    setSelectedImageIndex(imageIndex);
    setViewerOpen(true);
  };

  const handleReplyMessage = (msg: Message) => {
    setReplyToMessage(msg);
  };

  const handleReactMessage = async (msg: Message, reactionType: string) => {
    if (!activeConversation?._id || !currentUser?._id || !msg.msg_id) return;

    try {
      await MessageService.reactToMessage(
        activeConversation._id,
        msg.msg_id,
        currentUser._id,
        reactionType,
      );
    } catch (error) {
      console.error("Thả reaction thất bại:", error);
    }
  };

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: "auto" });
  }, [messages]);

  return (
    <div className="flex-1 flex h-full overflow-hidden">
      {/* Main Chat Area */}
      <div className={`flex-1 flex flex-col bg-[#F2F4F7] h-full overflow-hidden transition-all duration-300 ${sidebarOpen ? 'mr-80' : ''}`}>
        {/* Header */}
        <ChatHeader 
          conversation={activeConversation}
          isSidebarOpen={sidebarOpen}
          onToggleSidebar={toggleSidebar}
        />

        {/* Danh sách tin nhắn */}
        <div className="flex-1 p-4 gap-2 overflow-y-auto custom-scrollbar flex flex-col">
          <div className="flex-1 min-h-0" />

          {messages.length === 0 ? (
            <ChatEmpty />
          ) : (
            messages.map((msg, index) => {
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

              const isFirstInSequence =
                !prevMsg || prevMsg.sender_id !== msg.sender_id || showTime;
              const isLastInSequence =
                !nextMsg || nextMsg.sender_id !== msg.sender_id || nextShowTime;
              const notificationContent =
                msg.content?.[0]?.text || msg.content?.[0]?.name || "";

              return (
                <React.Fragment key={msg._id}>
                  {/* A. Dòng thời gian */}
                  {showTime && (
                    <ChatTimeSeparator
                      time={formatChatTimestamp(msg.createdAt || "")}
                    />
                  )}

                  {/* B. Nội dung tin nhắn */}
                  {isSystemMsg ? (
                    <ChatNotification type={msg.type} content={notificationContent} />
                  ) : (
                    <ChatMessage
                      msg={msg}
                      isMe={isMe}
                      currentUserId={currentUser?._id}
                      isFirstInSequence={isFirstInSequence}
                      isLastInSequence={isLastInSequence}
                      onMediaClick={(imageIndex) =>
                        handleOpenMedia(msg._id, imageIndex)
                      }
                      onReply={handleReplyMessage}
                      onReact={handleReactMessage}
                    />
                  )}
                </React.Fragment>
              );
            })
          )}

          <div ref={messagesEndRef} />
        </div>

        {/* Ô nhập liệu */}
        <ChatInput
          conversationId={activeConversation._id}
          senderId={currentUser?._id || ""}
          onSendSuccess={loadMessages}
          replyToMessage={replyToMessage}
          onCancelReply={() => setReplyToMessage(null)}
        />

        {/* Media Viewer - Giữ đầy đủ props từ cả 2 bản */}
        {viewerOpen && (
          <MediaViewer
            isOpen={viewerOpen}
            onClose={() => setViewerOpen(false)}
            initialMessageId={selectedMediaId}
            initialImageIndex={selectedImageIndex}
            messages={messages}
          />
        )}
      </div>

      {/* Right Sidebar */}
      <ChatSidebarRight
        conversation={activeConversation}
        isOpen={sidebarOpen}
        onClose={() => {
          if (onToggleSidebar) {
            onToggleSidebar();
          } else {
            setInternalSidebarOpen(false);
          }
        }}
      />
    </div>
  );
};

export default ChatArea;
