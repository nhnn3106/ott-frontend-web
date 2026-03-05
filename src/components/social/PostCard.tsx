import React, { useState, useRef, useEffect } from "react";
import {
  Globe,
  MoreHorizontal,
  ThumbsUp,
  MessageCircle,
  Share2,
  Pencil,
  Trash2,
} from "lucide-react";
import type { Post, PostUser } from "./types";
import UserAvatar from "./UserAvatar";
import PostMediaGrid from "./PostMediaGrid";
import RelationshipBadge from "./RelationshipBadge";
import CommentSection from "./CommentSection";
import { useNavigate } from "react-router-dom";
import type { UserProfile } from "../../services/social.service";

const fmtCount = (n: number) =>
  n >= 1000 ? `${(n / 1000).toFixed(1)}K` : String(n);

/* ─ Reaction definitions ───────────────────────────────────── */
const REACTIONS = [
  { key: "like", emoji: "👍", label: "Thích", color: "text-blue-500" },
  { key: "love", emoji: "❤️", label: "Yêu thích", color: "text-red-500" },
  { key: "haha", emoji: "😂", label: "Hà hà", color: "text-yellow-500" },
  { key: "wow", emoji: "😮", label: "Wow", color: "text-yellow-500" },
  { key: "sad", emoji: "😢", label: "Buồn bả", color: "text-yellow-500" },
  { key: "angry", emoji: "😡", label: "Phẫn nộ", color: "text-orange-500" },
] as const;

type ReactionKey = (typeof REACTIONS)[number]["key"];
export type { ReactionKey };

interface Props {
  post: Post;
  /** Reaction hiện tại của user (khôi phục từ server khi mount). */
  initialReaction?: ReactionKey;
  /**
   * Số lượng từng loại reaction của bài post (không phụ thuộc user).
   * Nếu không truyền thì toàn bộ post.likes sẽ gán vào bucket "like".
   */
  initialReactionCounts?: Partial<Record<ReactionKey, number>>;
  /** Được gọi khi user toggle: key = loại reaction mới, null = bỏ reaction. */
  onToggleLike: (key: ReactionKey | null) => void;
  onDelete?: (id: string) => void;
  onEdit?: (post: Post) => void;
  currentUser: PostUser;
}

const PostCard: React.FC<Props> = ({
  post,
  initialReaction,
  initialReactionCounts,
  onToggleLike,
  onDelete,
  onEdit,
  currentUser,
}) => {
  const [showComments, setShowComments] = useState(false);
  const [commentCount, setCommentCount] = useState(post.comments);
  const [reaction, setReaction] = useState<ReactionKey | null>(
    initialReaction ?? null,
  );
  // Seed reaction counts từ server (breakdown thực tế), fallback vào bucket "like"
  const [reactionCounts, setReactionCounts] = useState<
    Record<ReactionKey, number>
  >(() =>
    initialReactionCounts ?
      {
        like: initialReactionCounts.like ?? 0,
        love: initialReactionCounts.love ?? 0,
        haha: initialReactionCounts.haha ?? 0,
        wow: initialReactionCounts.wow ?? 0,
        sad: initialReactionCounts.sad ?? 0,
        angry: initialReactionCounts.angry ?? 0,
      }
    : { like: post.likes, love: 0, haha: 0, wow: 0, sad: 0, angry: 0 },
  );
  const [showPicker, setShowPicker] = useState(false);
  const hoverTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [showMenu, setShowMenu] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!showMenu) return;
    const handler = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        setShowMenu(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, [showMenu]);

  const currentReaction = REACTIONS.find((r) => r.key === reaction) ?? null;

  // Sorted list of reaction types that have at least 1 count
  const topReactions = REACTIONS.filter((r) => reactionCounts[r.key] > 0).sort(
    (a, b) => reactionCounts[b.key] - reactionCounts[a.key],
  );

  const totalReactions = Object.values(reactionCounts).reduce(
    (s, n) => s + n,
    0,
  );

  const handleReactionClick = (key: ReactionKey) => {
    const prev = reaction;
    const wasReacted = prev === key;
    const newReaction = wasReacted ? null : key;
    setReaction(newReaction);
    setShowPicker(false);
    setReactionCounts((c) => {
      const next = { ...c };
      if (prev) next[prev] = Math.max(0, next[prev] - 1);
      if (!wasReacted) next[key] = next[key] + 1;
      return next;
    });
    onToggleLike(newReaction);
  };

  const handleLikeButtonClick = () => {
    if (reaction) {
      setReactionCounts((c) => ({
        ...c,
        [reaction]: Math.max(0, c[reaction] - 1),
      }));
      setReaction(null);
      onToggleLike(null);
    } else {
      setReactionCounts((c) => ({ ...c, like: c.like + 1 }));
      setReaction("like");
      onToggleLike("like");
    }
  };

  const onMouseEnterLike = () => {
    hoverTimer.current = setTimeout(() => setShowPicker(true), 400);
  };
  const onMouseLeaveLike = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };
  const onMouseEnterPicker = () => {
    if (hoverTimer.current) clearTimeout(hoverTimer.current);
  };
  const onMouseLeavePicker = () => {
    setShowPicker(false);
  };

  const navigate = useNavigate();

  const goToProfile = (acccountId: string) => {
    navigate(`/social/profile/${acccountId}`);
  };

  return (
    <div className="bg-white rounded-2xl shadow-sm overflow-hidden">
      {/* Relationship badge */}
      <RelationshipBadge
        relationship={post.relationship}
        label={post.relationshipLabel}
      />

      {/* Header */}
      <div className="flex items-center justify-between px-4 pt-4 pb-2">
        <div className="flex items-center gap-3">
          <div
            onClick={() => goToProfile(post.author.id)}
            className="rounded-full overflow-hidden cursor-pointer ring-2 ring-transparent hover:ring-primary-400 transition shrink-0">
            <UserAvatar user={post.author} size="size-10" />
          </div>
          <div onClick={() => goToProfile(post.author.id)}>
            <p className="font-semibold text-gray-800 hover:underline cursor-pointer leading-tight">
              {post.author.name}
            </p>
            <div className="flex items-center gap-1 text-gray-400 text-xs mt-0.5">
              <span>{post.time}</span>
              <span>·</span>
              <Globe className="size-3" />
            </div>
          </div>
        </div>
        <div className="flex items-center">
          <div ref={menuRef} className="relative">
            <button
              onClick={() => setShowMenu((v) => !v)}
              className="p-2 rounded-full hover:bg-primary-50 transition">
              <MoreHorizontal className="size-5 text-primary-400" />
            </button>
            {showMenu && (
              <div className="absolute right-0 top-full mt-1 w-44 bg-white border border-gray-200 rounded-xl shadow-lg z-30 overflow-hidden">
                {post.relationship === "self" ?
                  <>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onEdit?.(post);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-gray-700 hover:bg-primary-50 transition">
                      <Pencil className="size-4 text-primary-400" />
                      Chỉnh sửa bài viết
                    </button>
                    <button
                      onClick={() => {
                        setShowMenu(false);
                        onDelete?.(post.id);
                      }}
                      className="w-full flex items-center gap-2.5 px-4 py-2.5 text-sm text-red-600 hover:bg-red-50 transition">
                      <Trash2 className="size-4" />
                      Xóa bài viết
                    </button>
                  </>
                : <p className="px-4 py-2.5 text-xs text-gray-400 select-none">
                    Không có tùy chọn
                  </p>
                }
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Body text */}
      {post.content && (
        <p className="px-4 pb-3 text-gray-800 leading-relaxed">
          {post.content}
        </p>
      )}

      {/* Media grid */}
      <PostMediaGrid media={post.media} />

      {/* Reaction counts */}
      {(totalReactions > 0 || commentCount > 0 || post.shares > 0) && (
        <div className="px-4 py-2 flex items-center justify-between text-primary-400 text-sm border-t border-primary-100">
          <div className="flex items-center gap-1.5">
            {topReactions.length > 0 && (
              <>
                <div className="flex -space-x-1">
                  {topReactions.slice(0, 3).map((r) => (
                    <span
                      key={r.key}
                      className="size-4.5 bg-white border border-gray-100 rounded-full flex items-center justify-center text-[11px] shadow-sm"
                      title={`${r.label}: ${reactionCounts[r.key]}`}>
                      {r.emoji}
                    </span>
                  ))}
                </div>
                <span>{fmtCount(totalReactions)}</span>
              </>
            )}
          </div>
          <div className="flex gap-3 text-xs">
            <button
              onClick={() => setShowComments((v) => !v)}
              className="hover:underline cursor-pointer">
              {commentCount} bình luận
            </button>
            <span className="hover:underline cursor-pointer">
              {post.shares} lượt chia sẻ
            </span>
          </div>
        </div>
      )}

      {/* Action buttons */}
      <div className="px-4 py-1 border-t border-primary-100 flex">
        {/* Like button with hover-to-react picker */}
        <div
          className="flex-1 relative"
          onMouseEnter={onMouseEnterLike}
          onMouseLeave={onMouseLeaveLike}>
          {/* Floating reaction picker */}
          {showPicker && (
            <div
              onMouseEnter={onMouseEnterPicker}
              onMouseLeave={onMouseLeavePicker}
              className="absolute bottom-full left-0 mb-2 bg-white border border-gray-200 rounded-2xl shadow-xl px-2 py-1.5 flex items-center gap-1 z-20"
              style={{ minWidth: "max-content" }}>
              {REACTIONS.map((r) => (
                <button
                  key={r.key}
                  onClick={() => handleReactionClick(r.key)}
                  title={r.label}
                  className={`flex flex-col items-center gap-0.5 px-1.5 py-1 rounded-xl transition-transform hover:scale-125 hover:bg-gray-50 ${
                    reaction === r.key ? "scale-125" : ""
                  }`}>
                  <span className="text-2xl leading-none">{r.emoji}</span>
                  <span className={`text-[10px] font-medium ${r.color}`}>
                    {r.label}
                  </span>
                </button>
              ))}
            </div>
          )}

          <button
            onClick={handleLikeButtonClick}
            className={`w-full flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-primary-50 transition font-medium text-sm ${
              currentReaction ? currentReaction.color : "text-gray-400"
            }`}>
            {currentReaction ?
              <span className="text-lg leading-none">
                {currentReaction.emoji}
              </span>
            : <ThumbsUp className="size-5" />}
            <span>{currentReaction ? currentReaction.label : "Thích"}</span>
          </button>
        </div>
        <button
          onClick={() => setShowComments((v) => !v)}
          className={`flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-primary-50 transition font-medium text-sm ${
            showComments ? "text-primary-500" : "text-primary-700"
          }`}>
          <MessageCircle
            className={`size-5 ${showComments ? "fill-primary-100" : ""}`}
          />
          Bình luận
        </button>
        <button className="flex-1 flex items-center justify-center gap-2 py-2 rounded-xl hover:bg-primary-50 transition text-primary-700 font-medium text-sm">
          <Share2 className="size-5" />
          Chia sẻ
        </button>
      </div>

      {/* Comment section */}
      {showComments && (
        <CommentSection
          postId={post.id}
          currentUser={currentUser}
          onCountChange={(delta) => setCommentCount((prev) => prev + delta)}
        />
      )}
    </div>
  );
};

export default PostCard;
