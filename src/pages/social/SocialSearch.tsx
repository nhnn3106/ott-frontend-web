import React, { useEffect, useState } from "react";
import { useSearchParams, Link } from "react-router-dom";
import { Search } from "lucide-react";
import SocialFeedLayout from "../../components/social/layout/SocialFeedLayout";
import SocialLeftSidebar from "../../components/social/SocialLeftSidebar";
import SocialRightSidebar from "../../components/social/SocialRightSidebar";
import PostCard from "../../components/social/PostCard";
import { useAuth } from "../../contexts/AuthContext";
import { searchPosts, fetchUserReactions } from "../../services/post.service";
import { useSocialFeedActions } from "../../hooks/social/useSocialFeedActions";
import type { Post } from "../../components/social/types";

const SocialSearch: React.FC = () => {
  const { isAuthenticated, user } = useAuth();
  const [searchParams] = useSearchParams();
  const query = searchParams.get("q") || "";

  const [posts, setPosts] = useState<Post[]>([]);
  const [userReactionMap, setUserReactionMap] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const [currentUser, setCurrentUser] = useState<any>(null);

  // Convert current user to Social User format
  useEffect(() => {
    if (user?.id) {
      setCurrentUser({
        id: user.id,
        name: user.fullName || "User",
        displayName: user.fullName || "User",
        avatar: user.avatarUrl,
        initials: user.fullName ? user.fullName[0] : "U",
        color: "bg-primary-500",
      });
    }
  }, [user]);

  // Hook for handling likes, deletion, updating, and sharing
  const { toggleLikePost, handleDeletePost } = useSocialFeedActions({
    currentUser: currentUser || { id: "" },
    setPosts,
    setUserReactionMap,
  });

  // Fetch search results and user reactions
  useEffect(() => {
    if (!isAuthenticated || !user?.id || !query.trim()) {
      setPosts([]);
      setLoading(false);
      return;
    }

    const loadSearchResults = async () => {
      setLoading(true);
      try {
        const results = await searchPosts(query.trim(), user.id, 0, 30);
        setPosts(results);

        // Load user reactions to highlight liked status
        const reactions = await fetchUserReactions(user.id);
        const map: Record<string, string> = {};
        for (const r of reactions) {
          if (r.targetType === "POST") {
            map[r.targetId] = r.reactionType.toLowerCase();
          }
        }
        setUserReactionMap(map);
      } catch (err) {
        console.error("Failed to load search results", err);
      } finally {
        setLoading(false);
      }
    };

    loadSearchResults();
  }, [query, isAuthenticated, user]);

  if (!isAuthenticated) {
    return (
      <SocialFeedLayout
        center={
          <div className="flex items-center justify-center min-h-[70vh]">
            <div className="bg-white border border-gray-200 rounded-2xl shadow-lg p-6 text-center max-w-md">
              <h2 className="text-lg font-semibold text-gray-900">Yêu cầu đăng nhập</h2>
              <p className="text-gray-500 mt-2">Vui lòng đăng nhập để sử dụng tính năng tìm kiếm bài viết.</p>
              <Link to="/login" className="inline-flex items-center justify-center mt-4 px-4 py-2 rounded-xl bg-primary-500 text-white font-semibold hover:bg-primary-600 transition">
                Đăng nhập
              </Link>
            </div>
          </div>
        }
      />
    );
  }

  return (
    <SocialFeedLayout
      currentUser={currentUser}
      left={<SocialLeftSidebar currentUser={currentUser} />}
      right={<SocialRightSidebar currentUserId={currentUser?.id} />}
      center={
        <div className="py-6">
          <div className="mb-6 flex items-center justify-between">
            <div>
              <h1 className="text-2xl font-bold text-gray-900">Kết quả tìm kiếm</h1>
              {query && (
                <p className="text-gray-500 mt-1">
                  Tìm thấy {posts.length} kết quả phù hợp cho từ khóa <span className="font-semibold text-primary-600">"{query}"</span>
                </p>
              )}
            </div>
            {query && (
              <span className="bg-primary-100 text-primary-700 px-3 py-1 rounded-full text-sm font-medium">
                {posts.length} kết quả
              </span>
            )}
          </div>

          {loading ? (
            <div className="text-center py-12 text-gray-500">
              <div className="animate-spin inline-block w-8 h-8 border-4 border-current border-t-transparent text-primary-600 rounded-full mb-2" role="status">
                <span className="sr-only">Đang tải...</span>
              </div>
              <p>Đang tìm kiếm bài viết...</p>
            </div>
          ) : posts.length === 0 ? (
            <div className="bg-white rounded-2xl p-12 text-center shadow-sm border border-gray-100">
              <div className="w-16 h-16 bg-gray-100 rounded-full flex items-center justify-center mx-auto mb-4">
                <Search className="w-8 h-8 text-gray-400" />
              </div>
              <h3 className="text-lg font-medium text-gray-900 mb-1">Không tìm thấy bài viết nào</h3>
              <p className="text-gray-500 max-w-sm mx-auto">
                Không tìm thấy bài viết nào phù hợp với từ khóa của bạn hoặc bạn không có quyền xem các bài viết đó.
              </p>
            </div>
          ) : (
            <div className="space-y-4">
              {posts.map((post) => (
                <PostCard
                  key={post.id}
                  post={post}
                  currentUser={currentUser}
                  onToggleLike={(reaction) => toggleLikePost(post.id, reaction)}
                  onDelete={() => handleDeletePost(post.id)}
                  userReaction={userReactionMap[post.id]}
                />
              ))}
            </div>
          )}
        </div>
      }
    />
  );
};

export default SocialSearch;
