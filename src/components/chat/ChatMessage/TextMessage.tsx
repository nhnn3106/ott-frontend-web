import type { Message } from "../../../types";
import { convertShortcodeToEmoji } from "../../../utils";

export const TextMessage = ({ msg, isMe }: { msg: Message; isMe: boolean }) => {
  const text = String(msg.content[0]);

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
        {convertShortcodeToEmoji(text)}
      </div>
    </div>
  );
};
