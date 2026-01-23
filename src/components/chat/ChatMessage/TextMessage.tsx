import { convertShortcodeToEmoji } from "../../../utils";

export const TextMessage = ({ content }: { content: any }) => {
  const text = Array.isArray(content)
    ? content.join("")
    : String(content || "");

  return (
    <div className="break-words whitespace-pre-wrap">
      {convertShortcodeToEmoji(text)}
    </div>
  );
};
