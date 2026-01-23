import { memo, useMemo } from "react";
import { getFullUrl } from "../../../utils";
import { TextMessage } from "./TextMessage";
import { ImageMessage } from "./ImageMessage";
import { VideoMessage } from "./VideoMessage";
import { FileMessage } from "./FileMessage";

export const ChatMessage = memo(
  ({ msg, isMe }: { msg: any; isMe: boolean }) => {
    const fullUrl = useMemo(() => getFullUrl(msg.content), [msg.content]);

    switch (msg.type) {
      case "image":
        return <ImageMessage url={fullUrl} isMe={isMe} />;

      case "video":
        return <VideoMessage url={fullUrl} isMe={isMe} />;

      case "file":
        return (
          <FileMessage
            url={fullUrl}
            fileName={msg.fileName}
            size={msg.size}
            isMe={isMe}
          />
        );

      case "text":
      default:
        return <TextMessage msg={msg} isMe={isMe}/>;
    }
  },
  (prev, next) => { 
    return (
      prev.msg._id === next.msg._id && prev.msg.content === next.msg.content
    );
  },
);
