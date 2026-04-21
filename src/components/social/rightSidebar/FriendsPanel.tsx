import React from "react";
import { useNavigate } from "react-router-dom";
import { Users } from "lucide-react";
import avatar from "../../../assets/avatar.png";
import type { FriendOption } from "../../../services/social.service";

interface Props {
  friends: FriendOption[];
  loading: boolean;
}

const FriendsPanel: React.FC<Props> = ({ friends, loading }) => {
  const navigate = useNavigate();
  const goProfile = (userId: string) => {
    if (!userId) return;
    navigate(`/social/profile/${userId}`);
  };

  return (
    <div className="border-t border-primary-200 pt-4">
      <div className="flex items-center justify-between mb-3">
        <h3 className="font-semibold text-primary-800">Ban be</h3>
        <button className="text-primary-500 font-medium text-sm hover:underline">
          Xem tat ca
        </button>
      </div>
      {loading && (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <Users className="size-8 text-primary-200" />
          <p className="text-xs text-gray-400">Dang tai ban be...</p>
        </div>
      )}
      {!loading && friends.length === 0 && (
        <div className="flex flex-col items-center gap-2 py-4 text-center">
          <Users className="size-8 text-primary-200" />
          <p className="text-xs text-gray-400">Chua co ban be</p>
        </div>
      )}
      {!loading && friends.length > 0 && (
        <div className="space-y-3">
          {friends.map((friend) => (
            <div key={friend.id} className="flex items-center gap-3">
              <button
                type="button"
                onClick={() => goProfile(friend.id)}
                className="size-10 rounded-full overflow-hidden shrink-0 shadow focus:outline-none">
                <img
                  src={friend.avatarUrl ?? avatar}
                  alt={friend.name}
                  className="size-full object-cover"
                />
              </button>
              <div className="flex-1 min-w-0">
                <button
                  type="button"
                  onClick={() => goProfile(friend.id)}
                  className="font-semibold text-gray-800 text-sm truncate text-left hover:underline">
                  {friend.name}
                </button>
                <p className="text-xs text-gray-400 mt-0.5">Ban be</p>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
};

export default FriendsPanel;
