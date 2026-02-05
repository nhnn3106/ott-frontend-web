import type { Message } from "../../../types";
import { MessageLayout } from "./MessageLayout"; // Import Layout chung

export const ImageMessage = ({
  msg,
  url,
  isMe,
  isFirstInSequence,
  isLastInSequence,
}: {
  msg: Message;
  url: string;
  isMe: boolean;
  isFirstInSequence: boolean;
  isLastInSequence: boolean;
}) => {
  return (
    // 1. Dùng MessageLayout để bao bọc
    <MessageLayout
      msg={msg}
      isMe={isMe}
      isFirst={isFirstInSequence}
      isLast={isLastInSequence}
    >
      {(borderRadius) => (
        // 2. Nội dung Ảnh
        <div
          className={`
            relative overflow-hidden group cursor-pointer border border-gray-200 shadow-sm transition-all hover:brightness-90
            ${borderRadius} 
          `}
          onClick={() => window.open(url, "_blank")}
        >
          <img
            src={url}
            alt="Attachment"
            className="block max-w-full h-auto object-cover max-h-[400px] min-w-[100px]"
            loading="lazy"
          />
        </div>
      )}
    </MessageLayout>
  );
};
