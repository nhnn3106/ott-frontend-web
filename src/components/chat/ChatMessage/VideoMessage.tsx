import { useRef, useState } from "react";
import { Play } from "lucide-react";

export const VideoMessage = ({ url, isMe }: { url: string; isMe: boolean }) => {
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
    <div
      className={`flex w-full mb-1 ${isMe ? "justify-end" : "justify-start"}`}
    >
      <div
        className="relative max-w-[300px] rounded-2xl overflow-hidden bg-black shadow-sm group cursor-pointer"
        onClick={handleTogglePlay}
      >
        <video
          ref={videoRef}
          src={url}
          className="w-full h-full object-cover max-h-[400px]"
          controls={isPlaying}
          preload="metadata"
          onPlay={onPlay}
          onPause={onPause}
        />

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
    </div>
  );
};
