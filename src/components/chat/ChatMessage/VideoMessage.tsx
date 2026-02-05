import { useRef, useState } from "react";
import { Play } from "lucide-react";
import type { Message } from "../../../types";
import { MessageLayout } from "./MessageLayout"; // Import Layout chung

export const VideoMessage = ({
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
  const videoRef = useRef<HTMLVideoElement>(null);
  const [isPlaying, setIsPlaying] = useState(false);

  const handleTogglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const onPlay = () => setIsPlaying(true);
  const onPause = () => setIsPlaying(false);

  return (
    <MessageLayout
      msg={msg}
      isMe={isMe}
      isFirst={isFirstInSequence}
      isLast={isLastInSequence}
    >
      {(borderRadius) => (
        // --- 3. Phần nội dung riêng của Video ---
        <div
          className={`relative max-w-[300px] overflow-hidden bg-black shadow-sm group cursor-pointer border border-gray-100 transition-all
          ${borderRadius} 
          `}
          onClick={handleTogglePlay}
        >
          <video
            ref={videoRef}
            src={url}
            className="w-full h-full object-cover max-h-[400px]"
            controls={isPlaying} // Chỉ hiện controls khi đang play
            preload="metadata"
            onPlay={onPlay}
            onPause={onPause}
          />

          {/* Overlay nút Play khi đang Pause */}
          {!isPlaying && (
            <div className="absolute inset-0 flex items-center justify-center bg-black/20 group-hover:bg-black/30 transition-all">
              <div className="w-12 h-12 bg-white/90 rounded-full flex items-center justify-center shadow-lg backdrop-blur-sm transform group-hover:scale-110 transition-transform">
                <Play
                  className="w-5 h-5 text-gray-900 ml-1"
                  fill="currentColor"
                />
              </div>
            </div>
          )}
        </div>
      )}
    </MessageLayout>
  );
};
