import React, { useState, useEffect, useRef, useCallback } from "react";
import type { Post, PostUser, StoryItem } from "../social/types";
import type { UploadedMedia } from "../social/CreatePostModal";
import {
  fetchPostsWithPage,
  createPost,
  toggleLike,
  deletePost,
  fetchUserReactions,
  fetchPostReactions,
} from "../../services/post.service";
import { fetchUsers } from "../../services/social.service";
import SocialLeftSidebar from "../social/SocialLeftSidebar";
import PostFeed from "../social/PostFeed";
import SocialRightSidebar from "../social/SocialRightSidebar";
import CreatePostModal from "../social/CreatePostModal";

/* ─── Avatar colour palette (fallback cho avatar DB users) ──── */
const AVATAR_COLORS = [
  "bg-primary-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-sky-500",
];

/* ─── Placeholder khi chưa fetch được user từ backend ─── */
const DEFAULT_USER: PostUser = {
  id: "",
  name: "Người dùng",
  color: "bg-primary-500",
};

const SocialLayout: React.FC = () => {
  const [posts, setPosts] = useState<Post[]>([]);
  const [currentUser, setCurrentUser] = useState<PostUser>(DEFAULT_USER);
  const [stories, setStories] = useState<StoryItem[]>([]);
  /** postId → reactionKey ("like" | "love" | ...) của user hiện tại */
  const [userReactionMap, setUserReactionMap] = useState<
    Record<string, string>
  >({});
  /** postId → { like: N, love: N, ... } - breakdown thực tế từ server */
  const [postReactionCountsMap, setPostReactionCountsMap] = useState<
    Record<string, Record<string, number>>
  >({});
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [openWithFeeling, setOpenWithFeeling] = useState(false);

  const openModal = (withFeeling = false) => {
    setOpenWithFeeling(withFeeling);
    setIsModalOpen(true);
  };
  const [loadingDB, setLoadingDB] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [hasMore, setHasMore] = useState(true);
  const pageRef = useRef(0);
  const containerRef = useRef<HTMLDivElement>(null);
  const currentUserRef = useRef<typeof currentUser>(DEFAULT_USER);

  /* ── Load data từ backend khi mount ──────────────────── */
  useEffect(() => {
    (async () => {
      try {
        // 1. Lấy danh sách users → user[0] là "mình" (current session)
        const users = await fetchUsers();
        const me = users[0];
        const dbCurrentUser: PostUser | undefined =
          me ?
            {
              id: me.id,
              name: me.displayName ?? me.username,
              avatar: me.avatarUrl ?? undefined,
              color: AVATAR_COLORS[0],
            }
          : undefined;

        if (dbCurrentUser) {
          setCurrentUser(dbCurrentUser);
          currentUserRef.current = dbCurrentUser;
        }

        // 2. Các user còn lại → Stories (tối đa 5 người)
        const dbStories: StoryItem[] = users.slice(1, 6).map((u) => ({
          id: u.id,
          name: u.displayName ?? u.username,
          isBirthday: false,
        }));
        setStories(dbStories);

        // 3. Lấy trang 0 posts từ DB
        const result = await fetchPostsWithPage(0, 5, dbCurrentUser?.id ?? "");
        if (result && result.posts.length > 0) {
          setPosts(result.posts);
          pageRef.current = 0;
          setHasMore(result.hasMore);

          // 4a. Fetch reaction breakdown của từng post song song
          const reactionResults = await Promise.all(
            result.posts.map((p) => fetchPostReactions(p.id)),
          );
          const countsMap: Record<string, Record<string, number>> = {};
          result.posts.forEach((p, i) => {
            countsMap[p.id] = reactionResults[i];
          });
          setPostReactionCountsMap(countsMap);
        } else {
          setHasMore(false);
        }

        // 4. Khôi phục reactions của user hiện tại
        if (dbCurrentUser?.id) {
          const reactions = await fetchUserReactions(dbCurrentUser.id);
          const map: Record<string, string> = {};
          for (const r of reactions) {
            // targetType === "POST" và chỉ lấy 1 reaction mới nhất mỗi post
            if (r.targetType === "POST") {
              map[r.targetId] = r.reactionType.toLowerCase();
            }
          }
          setUserReactionMap(map);
        }
      } catch {
        // backend không khả dụng → feed trống
      } finally {
        setLoadingDB(false);
      }
    })();
  }, []);

  /* ── Infinite scroll: load trang tiếp khi cuộn gần đáy ────── */
  const loadNextPage = useCallback(async () => {
    if (loadingMore || !hasMore) return;
    setLoadingMore(true);
    try {
      const nextPage = pageRef.current + 1;
      const result = await fetchPostsWithPage(
        nextPage,
        10,
        currentUserRef.current.id || undefined,
      );
      if (result && result.posts.length > 0) {
        setPosts((prev) => {
          const existingIds = new Set(prev.map((p) => p.id));
          const newPosts = result.posts.filter((p) => !existingIds.has(p.id));
          return [...prev, ...newPosts];
        });
        pageRef.current = nextPage;
        setHasMore(result.hasMore);

        // Fetch reaction breakdown cho các post mới
        const reactionResults = await Promise.all(
          result.posts.map((p) => fetchPostReactions(p.id)),
        );
        setPostReactionCountsMap((prev) => {
          const updated = { ...prev };
          result.posts.forEach((p, i) => {
            updated[p.id] = reactionResults[i];
          });
          return updated;
        });
      } else {
        setHasMore(false);
      }
    } finally {
      setLoadingMore(false);
    }
  }, [loadingMore, hasMore]);

  useEffect(() => {
    const container = containerRef.current;
    if (!container) return;
    const handleScroll = () => {
      const { scrollTop, scrollHeight, clientHeight } = container;
      if (scrollHeight - scrollTop - clientHeight < 400) {
        loadNextPage();
      }
    };
    container.addEventListener("scroll", handleScroll, { passive: true });
    return () => container.removeEventListener("scroll", handleScroll);
  }, [loadNextPage]);

  const toggleLikePost = async (id: string, reactionKey: string | null) => {
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

    // Call API với đúng loại reaction
    const result = await toggleLike(
      id,
      currentUser.id,
      (reactionKey ?? "LIKE").toUpperCase(),
    );
    if (result !== null) {
      // Sync với server
      setUserReactionMap((prev) => {
        const next = { ...prev };
        if (result.liked && result.reactionType) {
          next[id] = result.reactionType.toLowerCase();
        } else {
          delete next[id];
        }
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
    // Optimistic update
    setPosts((prev) => prev.filter((p) => p.id !== id));
    await deletePost(id);
  };

  const handleNewPost = async (
    content: string,
    media: UploadedMedia[],
    visibility: string,
  ) => {
    if (!currentUser.id) return; // guard: user not loaded yet
    // Optimistic update: hiển thị ngay lập tức
    const tempId = `temp-${Date.now()}`;
    const optimisticPost: Post = {
      id: tempId,
      author: currentUser,
      time: "Vừa xong",
      content,
      media: media.map((m) => ({ type: m.type, url: m.url })),
      likes: 0,
      comments: 0,
      shares: 0,
      visibility,
      relationship: "self",
    };
    setPosts((prev) => [optimisticPost, ...prev]);

    // Gọi API lưu vào DB + S3
    const files = media.map((m) => m.file);
    const captions = media.map((m) => m.caption ?? "");
    const saved = await createPost(
      currentUser.id,
      content,
      visibility,
      files,
      captions,
    );

    if (saved) {
      // Thay thế bài post tạm bằng bài post từ DB (có ID thực)
      setPosts((prev) => prev.map((p) => (p.id === tempId ? saved : p)));
    }
    // Nếu lỗi → giữ nguyên optimistic post (không rollback để UX mượt)
  };

  return (
    <>
      <div
        ref={containerRef}
        className="bg-primary-50 w-full min-h-screen overflow-y-auto">
        <div className="max-w-350 mx-auto px-4 py-4">
          <div className="flex gap-4">
            <SocialLeftSidebar currentUser={currentUser} />
            <PostFeed
              posts={posts}
              userReactionMap={userReactionMap}
              postReactionCountsMap={postReactionCountsMap}
              onToggleLike={toggleLikePost}
              onDelete={handleDeletePost}
              onOpenModal={() => openModal(false)}
              onOpenWithFeeling={() => openModal(true)}
              currentUser={currentUser}
              stories={stories}
              loading={loadingDB}
            />
            <SocialRightSidebar />
          </div>
          {/* Indicator cuộn vô hạn */}
          {loadingMore && (
            <div className="flex justify-center items-center py-6">
              <div className="w-8 h-8 border-4 border-primary-300 border-t-primary-600 rounded-full animate-spin" />
            </div>
          )}
          {!hasMore && !loadingDB && posts.length > 0 && (
            <p className="text-center text-sm text-gray-400 py-4">
              Bạn đã xem hết tất cả bài viết
            </p>
          )}
        </div>
      </div>

      <CreatePostModal
        isOpen={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
          setOpenWithFeeling(false);
        }}
        onPost={handleNewPost}
        currentUser={currentUser}
        openWithFeeling={openWithFeeling}
      />
    </>
  );
};

export default SocialLayout;
