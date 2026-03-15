import React from "react";
import { Plus } from "lucide-react";
import avatar from "../../assets/avatar.png";
import type { StoryItem } from "./types";

/* Gradient palette cho thumbnail stories */
const GRADIENTS = [
  "from-pink-400 to-rose-500",
  "from-violet-400 to-purple-600",
  "from-sky-400 to-blue-600",
  "from-emerald-400 to-teal-600",
  "from-amber-400 to-orange-500",
  "from-primary-400 to-indigo-600",
];

interface Props {
  stories: StoryItem[];
  currentUserAvatar: string;
}

const StoryReel: React.FC<Props> = ({ stories, currentUserAvatar }) => (
  <div className="bg-white rounded-2xl shadow-sm p-3">
    <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
      {/* Create Story */}
      <div className="shrink-0 w-27.5 h-48 rounded-xl overflow-hidden relative cursor-pointer group shadow">
        <div className="w-full h-[72%] overflow-hidden">
          <img
            src={currentUserAvatar}
            alt="create"
            className="w-full h-full object-cover group-hover:scale-105 transition duration-300"
          />
        </div>
        <div className="absolute bottom-0 left-0 right-0 bg-white flex flex-col items-center pt-5 pb-2">
          <div className="absolute -top-4 size-8 bg-primary-500 rounded-full flex items-center justify-center border-2 border-white shadow">
            <Plus className="size-4 text-white" />
          </div>
          <span className="text-xs font-semibold text-gray-800">Tạo tin</span>
        </div>
      </div>

      {/* Friend stories */}
      {stories.map((story, i) => (
        <div
          key={story.id}
          className="shrink-0 w-27.5 h-48 rounded-xl overflow-hidden relative cursor-pointer group shadow">
          <div
            className={`absolute inset-0 bg-linear-to-br ${GRADIENTS[i % GRADIENTS.length]}`}
          />
          <img
            src={avatar}
            alt={story.name}
            className="absolute inset-0 w-full h-full object-cover opacity-60 group-hover:opacity-70 group-hover:scale-105 transition duration-300"
          />
          <div className="absolute inset-0 bg-linear-to-b from-transparent via-transparent to-black/50" />
          <div className="absolute top-2 left-2 size-9 rounded-full border-[3px] border-primary-400 overflow-hidden shadow">
            <img
              src={avatar}
              alt={story.name}
              className="size-full object-cover"
            />
          </div>
          {story.isBirthday && (
            <div className="absolute top-1 right-1 text-sm">🎂</div>
          )}
          <div className="absolute bottom-2 left-2 right-2">
            <span className="text-white text-xs font-semibold leading-tight line-clamp-2">
              {story.name}
            </span>
          </div>
        </div>
      ))}
    </div>
  </div>
);

export default StoryReel;
