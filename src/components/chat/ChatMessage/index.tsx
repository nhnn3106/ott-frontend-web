import { memo, useMemo } from "react";
import { getFullUrl } from "../../../utils";
import { TextMessage } from "./TextMessage";
import { ImageMessage } from "./ImageMessage";
import { VideoMessage } from "./VideoMessage";
import { FileMessage } from "./FileMessage";

export const ChatMessage = memo(
  ({ msg, isMe }: { msg: any; isMe: boolean }) => {
    const fullUrl = useMemo(() => getFullUrl(msg.content), [msg.content]);

    const renderContent = () => {
      switch (msg.type) {
        case "image":
          return <ImageMessage url={fullUrl} />;

        case "video":
          return <VideoMessage url={fullUrl} />;

        case "file":
          return (
            <FileMessage
              url={fullUrl}
              fileName={msg.fileName}
              size={msg.size}
            />
          );

        case "text":
        default:
          return <TextMessage content={msg.content} />;
      }
    };

    return (
      <div
        className={`flex w-full mb-1 ${isMe ? "justify-end" : "justify-start"}`}
      >
        <div
          className={`px-4 py-2.5 max-w-[75%] text-[15px] leading-relaxed shadow-sm transition-all
          ${
            isMe
              ? "bg-[#EFDCCB] text-gray-900 rounded-2xl rounded-tr-sm"
              : "bg-white text-gray-900 rounded-2xl rounded-tl-sm border border-gray-100"
          }`}
        >
          {renderContent()}
        </div>
      </div>
    );
  },
  (prev, next) => {
    return (
      prev.msg._id === next.msg._id && prev.msg.content === next.msg.content
    );
  },
);
