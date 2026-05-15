import React, { useEffect, useState } from "react";
import {
  LiveKitRoom,
  RoomAudioRenderer,
  type TrackReferenceOrPlaceholder,
  useParticipants,
} from "@livekit/components-react";

import {

} from "lucide-react";

import "@livekit/components-styles";

interface LiveKitGroupCallProps {
  token: string;
  serverUrl: string;
  onLeave: () => void;
  video: boolean;
  name?: string;
  avatar?: string;
  conversationId?: string;
  userId?: string;
  callId?: string;
}

/**
 * LiveKit Group Call Component - Perfectly Aligned with CallPage 1:1 Design
 */
const LiveKitGroupCall: React.FC<LiveKitGroupCallProps> = ({
  token,
  serverUrl,
  onLeave,
  video,
}) => {
  return (
    <div className="h-screen w-screen bg-[#121212] text-white overflow-hidden flex flex-col font-body selection:bg-primary-500/30 relative">
      {/* Background radial gradient like CallPage */}
      <div className="absolute inset-0 z-0 bg-radial from-[#1e1e1e] to-[#0a0a0a] pointer-events-none" />
      <div className="absolute inset-0 z-0 pointer-events-none bg-linear-to-b from-black/40 via-transparent to-black/60" />

      {/* Global CSS Overrides for LiveKit Defaults */}
      <style dangerouslySetInnerHTML={{
        __html: `
        .lk-room-container {
          background-color: transparent !important;
          border: none !important;
        }
        .lk-video-container {
          background-color: transparent !important;
        }
        .lk-participant-tile {
          background-color: rgba(35, 26, 16, 0.4) !important;
          border-radius: 1.5rem !important;
          border: 1px solid rgba(255,255,255,0.05) !important;
          overflow: hidden !important;
        }
      ` }} />

      <LiveKitRoom
        video={video}
        audio={true}
        token={typeof token === "string" ? token.trim() : undefined}
        serverUrl={typeof serverUrl === "string" ? serverUrl.trim() : undefined}
        onDisconnected={onLeave}
        onError={(e) => {
          console.error("LiveKit Room Error:", e);
          alert(`Lỗi kết nối cuộc gọi: ${e.message}`);
          onLeave();
        }}
        className="flex-1 flex flex-col overflow-hidden relative z-10"
      >

        <RoomAudioRenderer />
      </LiveKitRoom>
    </div>
  );
};




export default LiveKitGroupCall;
