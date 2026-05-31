import React, { useState } from "react";
import { Eye, ShieldAlert } from "lucide-react";
import type { PostMediaItem } from "./types";

interface Props {
  item: PostMediaItem;
  alt: string;
  className?: string;
}

const isFlagged = (item: PostMediaItem) =>
  String(item.moderationStatus || "").toUpperCase() === "FLAGGED";

const PostModeratedImage: React.FC<Props> = ({ item, alt, className }) => {
  const [revealed, setRevealed] = useState(false);
  const flagged = isFlagged(item);
  const shouldBlur = flagged && !revealed;

  return (
    <div className="relative w-full h-full overflow-hidden">
      <img
        src={item.url}
        alt={alt}
        loading="lazy"
        className={`${className ?? ""} transition duration-300 ${
          shouldBlur ? "blur-md scale-105" : ""
        }`}
      />

      {shouldBlur && (
        <div className="absolute inset-0 flex flex-col items-center justify-center gap-3 bg-black/35 px-4 text-center text-white">
          <div className="flex items-center gap-2 rounded-full bg-black/45 px-3 py-1 text-xs font-semibold">
            <ShieldAlert className="size-4" />
            <span>Ảnh nhạy cảm</span>
          </div>
          <button
            type="button"
            className="inline-flex items-center gap-2 rounded-full bg-white px-4 py-2 text-sm font-semibold text-gray-900 shadow-sm hover:bg-gray-100"
            onPointerDown={(event) => event.stopPropagation()}
            onClick={(event) => {
              event.stopPropagation();
              setRevealed(true);
            }}>
            <Eye className="size-4" />
            <span>Xem ảnh</span>
          </button>
        </div>
      )}
    </div>
  );
};

export default PostModeratedImage;
