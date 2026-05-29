import React, { useState } from "react";
import {
  Users,
  Clock,
  Bookmark,
  Clapperboard,
  History,
  Search
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import type { PostUser } from "../types";
import UserAvatar from "../UserAvatar";

const NAV_ITEMS = [
  { icon: <Bookmark className="size-6 text-primary-600" />, label: "Đã lưu", route: "/social/saved" },
  { icon: <History className="size-6 text-primary-600" />, label: "Lịch sử xem", route: "/social/history" }
];

interface Props {
  currentUser: PostUser;
  onItemClick?: () => void;
}

const SocialLeftContent: React.FC<Props> = ({ currentUser, onItemClick }) => {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  const goToProfile = () => {
    if (currentUser.id) {
      navigate(`/social/profile/${currentUser.id}`);
      onItemClick?.();
    }
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (searchQuery.trim()) {
      navigate(`/social/search?q=${encodeURIComponent(searchQuery.trim())}`);
      onItemClick?.();
    }
  };

  return (
    <div className="space-y-4">
      <div
        onClick={goToProfile}
        className="flex items-center gap-3 p-2 rounded-xl hover:bg-primary-100 cursor-pointer mb-1 transition">
        <div className="size-9 rounded-full overflow-hidden ring-2 ring-primary-400 shrink-0">
          <UserAvatar user={currentUser} size="size-9" />
        </div>
        <span className="font-semibold text-gray-800">
          {currentUser?.displayName}
        </span>
      </div>

      {/* Search Input */}
      <form onSubmit={handleSearchSubmit} className="relative px-2">
        <input
          type="text"
          placeholder="Tìm kiếm bài viết..."
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          className="w-full pl-10 pr-4 py-2 bg-gray-100 focus:bg-white border border-transparent focus:border-primary-400 rounded-xl text-sm outline-none transition duration-200"
        />
        <Search className="absolute left-5 top-2.5 size-4 text-gray-400" />
      </form>

      {/* Nav items */}
      <nav className="space-y-0.5">
        {NAV_ITEMS.map((item, i) => (
          <div
            key={i}
            onClick={() => {
              if (item.route) navigate(item.route);
              onItemClick?.();
            }}
            className="flex items-center gap-3 p-2 rounded-xl hover:bg-gray-200 cursor-pointer transition">
            {item.icon}
            <span className="font-medium text-gray-700">{item.label}</span>
          </div>
        ))}
      </nav>
    </div>
  );
};

export default SocialLeftContent;
