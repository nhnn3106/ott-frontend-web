import React, { useState, useEffect } from "react";
import { useParams } from "react-router-dom";
import { Camera, MapPin, Briefcase, Heart, Users, Loader2 } from "lucide-react";
import avatar from "../../assets/avatar.png";
import {
  fetchPostsByUser,
  toggleLike,
  deletePost,
  fetchUserReactions,
  fetchPostReactions,
} from "../../services/post.service";
import type { Post, PostUser } from "../../components/social/types";
import PostCard from "../../components/social/PostCard";
import type { ReactionKey } from "../../components/social/PostCard";
import { fetchUsers } from "../../services/social.service";

const AVATAR_COLORS = [
  "bg-primary-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-sky-500",
];

const SocialProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  const [profileUser, setProfileUser] = useState<{
    displayName: string;
    username: string;
    avatarUrl?: string;
  } | null>(null);
  const [currentUser, setCurrentUser] = useState<PostUser>({
    id: "",
    name: "Người dùng",
    color: "bg-primary-500",
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [userReactionMap, setUserReactionMap] = useState<
    Record<string, string>
  >({});
  /** postId → { like: N, love: N, ... } - breakdown thực tế từ server */
  const [postReactionCountsMap, setPostReactionCountsMap] = useState<
    Record<string, Record<string, number>>
  >({});
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<
    "posts" | "about" | "friends" | "photos"
  >("posts");

  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
      // Load current user (first user = "me") and profile user
      const users = await fetchUsers();
      const me = users[0];
      if (me) {
        setCurrentUser({
          id: me.id,
          name: me.displayName ?? me.username,
          avatar: me.avatarUrl ?? undefined,
          color: AVATAR_COLORS[0],
        });
      }
      const profile = users.find((u) => u.id === userId);
      if (profile)
        setProfileUser({
          displayName: profile.displayName,
          username: profile.username,
          avatarUrl: profile.avatarUrl ?? undefined,
        });

      // Load posts of this user
      const userPosts = await fetchPostsByUser(userId, me?.id);
      setPosts(userPosts);

      // Fetch reaction breakdown của từng post song song
      if (userPosts.length > 0) {
        const reactionResults = await Promise.all(
          userPosts.map((p) => fetchPostReactions(p.id)),
        );
        const countsMap: Record<string, Record<string, number>> = {};
        userPosts.forEach((p, i) => {
          countsMap[p.id] = reactionResults[i];
        });
        setPostReactionCountsMap(countsMap);
      }

      // Khôi phục reactions của user hiện tại
      if (me?.id) {
        const reactions = await fetchUserReactions(me.id);
        const map: Record<string, string> = {};
        for (const r of reactions) {
          if (r.targetType === "POST") {
            map[r.targetId] = r.reactionType.toLowerCase();
          }
        }
        setUserReactionMap(map);
      }

      setLoading(false);
    })();
  }, [userId]);

  const handleToggleLike = async (
    id: string,
    reactionKey: ReactionKey | null,
  ) => {
    if (!currentUser.id) return;
    // Optimistic update
    setUserReactionMap((prev) => {
      const next = { ...prev };
      if (reactionKey) next[id] = reactionKey;
      else delete next[id];
      return next;
    });
    setPosts((prev) =>
      prev.map((p) =>
        p.id === id ?
          { ...p, likes: reactionKey ? p.likes + 1 : Math.max(0, p.likes - 1) }
        : p,
      ),
    );
    const result = await toggleLike(
      id,
      currentUser.id,
      (reactionKey ?? "LIKE").toUpperCase(),
    );
    if (result !== null) {
      setUserReactionMap((prev) => {
        const next = { ...prev };
        if (result.liked && result.reactionType)
          next[id] = result.reactionType.toLowerCase();
        else delete next[id];
        return next;
      });
      setPosts((prev) =>
        prev.map((p) =>
          p.id === id ? { ...p, likes: result.totalReactions } : p,
        ),
      );
    }
  };

  const handleDeletePost = async (id: string) => {
    setPosts((prev) => prev.filter((p) => p.id !== id));
    await deletePost(id);
  };

  const tabs = [
    { key: "posts", label: "Bài viết" },
    { key: "about", label: "Giới thiệu" },
    { key: "friends", label: "Bạn bè" },
    { key: "photos", label: "Ảnh" },
  ] as const;

  const displayName =
    profileUser?.displayName ?? profileUser?.username ?? `User ${userId ?? ""}`;

  return (
    <div className="bg-primary-50 w-full h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto pb-10">
        {/* Cover Photo */}
        <div className="relative bg-linear-to-r from-purple-400 via-pink-500 to-red-500 h-56 md:h-72 rounded-b-2xl">
          <button className="absolute bottom-4 right-4 bg-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition">
            <Camera className="size-5" />
            <span className="hidden md:inline">Chỉnh sửa ảnh bìa</span>
          </button>
        </div>

        {/* Profile Info Card */}
        <div className="bg-white rounded-2xl mx-4 -mt-16 relative shadow-lg">
          <div className="p-6">
            {/* Avatar and Name */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
              <div className="relative -mt-20">
                <div className="size-32 md:size-40 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  {profileUser?.avatarUrl ?
                    <img
                      src={profileUser.avatarUrl}
                      alt={displayName}
                      className="size-full object-cover"
                    />
                  : <img
                      src={avatar}
                      alt="Profile"
                      className="size-full object-cover"
                    />
                  }
                </div>
                <button className="absolute bottom-2 right-2 bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition">
                  <Camera className="size-4" />
                </button>
              </div>

              <div className="flex-1 text-center md:text-left mb-4">
                <h1 className="text-3xl font-bold text-gray-800">
                  {displayName}
                </h1>
                {profileUser?.username &&
                  profileUser.username !== profileUser.displayName && (
                    <p className="text-gray-400 text-sm mt-0.5">
                      @{profileUser.username}
                    </p>
                  )}
                <p className="text-gray-600 mt-1">
                  <Users className="inline size-4 mr-1" />
                  {posts.length} bài viết
                </p>
              </div>

              <div className="flex gap-2 mb-4">
                {currentUser.id === userId ?
                  <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium">
                    Chỉnh sửa trang cá nhân
                  </button>
                : <>
                    <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-medium">
                      Kết bạn
                    </button>
                    <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium">
                      Nhắn tin
                    </button>
                  </>
                }
              </div>
            </div>

            {/* Profile Details */}
            <div className="mt-6 pt-6 border-t border-gray-200">
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center gap-2 text-gray-700">
                  <Briefcase className="size-5 text-gray-500" />
                  <span>Làm việc tại Công ty ABC</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <MapPin className="size-5 text-gray-500" />
                  <span>Sống tại Hà Nội, Việt Nam</span>
                </div>
                <div className="flex items-center gap-2 text-gray-700">
                  <Heart className="size-5 text-gray-500" />
                  <span>Độc thân</span>
                </div>
              </div>
            </div>
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex gap-2 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-4 font-medium whitespace-nowrap transition ${
                    activeTab === tab.key ?
                      "text-blue-500 border-b-2 border-blue-500"
                    : "text-gray-600 hover:bg-gray-100 rounded-t-lg"
                  }`}>
                  {tab.label}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* Posts */}
        <div className="px-4 mt-4 space-y-4">
          {loading ?
            <div className="flex items-center justify-center py-16">
              <Loader2 className="size-8 animate-spin text-primary-400" />
            </div>
          : posts.length === 0 ?
            <div className="bg-white rounded-2xl p-6 shadow text-center py-12 text-gray-500">
              <p>Chưa có bài viết nào</p>
              <p className="text-sm mt-2">Hãy chia sẻ khoảnh khắc của bạn!</p>
            </div>
          : posts.map((post) => (
              <PostCard
                key={post.id}
                post={post}
                initialReaction={
                  userReactionMap[post.id] as ReactionKey | undefined
                }
                initialReactionCounts={
                  postReactionCountsMap[post.id] as
                    | Partial<Record<ReactionKey, number>>
                    | undefined
                }
                onToggleLike={(key) => handleToggleLike(post.id, key)}
                onDelete={handleDeletePost}
                currentUser={currentUser}
              />
            ))
          }
        </div>
      </div>
    </div>
  );
};

export default SocialProfile;
