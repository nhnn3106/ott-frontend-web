import React, { useState, useEffect, useRef } from "react";
import { useParams } from "react-router-dom";
import {
  Camera,
  MapPin,
  Briefcase,
  Heart,
  Users,
  Loader2,
  Pencil,
  Check,
  X,
  ImageIcon,
} from "lucide-react";
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
import type { ReactionKey } from "../../components/social/post/reactions";
import {
  fetchUsers,
  fetchUserById,
  uploadUserAvatar,
  uploadUserCover,
  updateUserProfile,
} from "../../services/social.service";
import type { UserProfile } from "../../services/social.service";

const AVATAR_COLORS = [
  "bg-primary-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-sky-500",
];

/* ─── Default bio fields ─────────────────────────────── */
const DEFAULT_PROFILE: UserProfile = {
  bio: "",
  work: "",
  location: "",
  relationship: "",
};

/* ─── Inline editable text field ─────────────────────── */
interface EditFieldProps {
  icon: React.ReactNode;
  placeholder: string;
  value: string;
  editing: boolean;
  onChange: (v: string) => void;
}
const EditField: React.FC<EditFieldProps> = ({
  icon,
  placeholder,
  value,
  editing,
  onChange,
}) => (
  <div className="flex items-center gap-2 text-gray-700">
    <span className="text-gray-500 shrink-0">{icon}</span>
    {editing ?
      <input
        className="flex-1 border-b border-primary-400 outline-none text-sm bg-transparent py-0.5"
        value={value}
        onChange={(e) => onChange(e.target.value)}
        placeholder={placeholder}
      />
    : <span className={`text-sm ${!value ? "text-gray-400 italic" : ""}`}>
        {value || placeholder}
      </span>
    }
  </div>
);

const SocialProfile: React.FC = () => {
  const { userId } = useParams<{ userId: string }>();

  /* ── Profile user ─────────────────────────────────── */
  const [profileUser, setProfileUser] = useState<{
    displayName: string;
    username: string;
    avatarUrl?: string;
    coverUrl?: string;
  } | null>(null);
  const [currentUser, setCurrentUser] = useState<PostUser>({
    id: "",
    name: "Người dùng",
    color: "bg-primary-500",
  });

  /* ── Avatar editing ───────────────────────────────── */
  const [localAvatar, setLocalAvatar] = useState<string | null>(null); // blob URL
  const [avatarModalOpen, setAvatarModalOpen] = useState(false);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarSaving, setAvatarSaving] = useState(false);
  const avatarInputRef = useRef<HTMLInputElement>(null);
  /* ── Cover editing ──────────────────────────────────────────── */
  const [localCover, setLocalCover] = useState<string | null>(null);
  const [coverModalOpen, setCoverModalOpen] = useState(false);
  const [coverFile, setCoverFile] = useState<File | null>(null);
  const [coverPreview, setCoverPreview] = useState<string | null>(null);
  const [coverSaving, setCoverSaving] = useState(false);
  const coverInputRef = useRef<HTMLInputElement>(null);
  /* ── About / bio ──────────────────────────────────── */
  const [profile, setProfile] = useState<UserProfile>(DEFAULT_PROFILE);
  const [editingAbout, setEditingAbout] = useState(false);
  const [draftProfile, setDraftProfile] =
    useState<UserProfile>(DEFAULT_PROFILE);
  const [aboutSaving, setAboutSaving] = useState(false);
  const [aboutSaveError, setAboutSaveError] = useState<string | null>(null);
  /* ── Posts ────────────────────────────────────────── */
  const [posts, setPosts] = useState<Post[]>([]);
  const [userReactionMap, setUserReactionMap] = useState<
    Record<string, string>
  >({});
  const [postReactionCountsMap, setPostReactionCountsMap] = useState<
    Record<string, Record<string, number>>
  >({});
  const [loading, setLoading] = useState(true);

  /* ── Tabs ─────────────────────────────────────────── */
  const [activeTab, setActiveTab] = useState<"posts" | "about" | "photos">(
    "posts",
  );

  const isOwner = !!currentUser.id && currentUser.id === userId;

  /* ── Load data ────────────────────────────────────── */
  useEffect(() => {
    if (!userId) return;
    (async () => {
      setLoading(true);
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
      const prof = users.find((u) => u.id === userId);
      if (prof) {
        setProfileUser({
          displayName: prof.displayName,
          username: prof.username,
          avatarUrl: prof.avatarUrl ?? undefined,
          coverUrl: prof.coverUrl ?? undefined,
        });
      }

      // Load full profile fields (bio, work, location, relationshipStatus)
      const full = await fetchUserById(userId);
      if (full) {
        setProfile({
          bio: full.bio ?? "",
          work: full.work ?? "",
          location: full.location ?? "",
          relationship: full.relationshipStatus ?? "",
        });
      }

      const userPosts = await fetchPostsByUser(userId, me?.id);
      setPosts(userPosts);

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

      if (me?.id) {
        const reactions = await fetchUserReactions(me.id);
        const map: Record<string, string> = {};
        for (const r of reactions) {
          if (r.targetType === "POST")
            map[r.targetId] = r.reactionType.toLowerCase();
        }
        setUserReactionMap(map);
      }
      setLoading(false);
    })();
  }, [userId]);

  /* ── Avatar modal handlers ────────────────────────── */
  const openAvatarModal = () => {
    setAvatarPreview(null);
    setAvatarFile(null);
    setAvatarModalOpen(true);
  };

  const handleAvatarFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setAvatarFile(file);
    const url = URL.createObjectURL(file);
    setAvatarPreview(url);
  };

  const handleAvatarSave = async () => {
    if (!avatarFile || !userId) return;
    setAvatarSaving(true);
    const newUrl = await uploadUserAvatar(userId, avatarFile);
    // Whether or not backend succeeded, show the preview locally
    const displayUrl = newUrl ?? avatarPreview!;
    setLocalAvatar(displayUrl);
    setAvatarModalOpen(false);
    setAvatarSaving(false);
  };

  /* ── Cover modal handlers ─────────────────────────── */
  const openCoverModal = () => {
    setCoverPreview(null);
    setCoverFile(null);
    setCoverModalOpen(true);
  };

  const handleCoverFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    setCoverFile(file);
    setCoverPreview(URL.createObjectURL(file));
  };

  const handleCoverSave = async () => {
    if (!coverFile || !userId) return;
    setCoverSaving(true);
    const newUrl = await uploadUserCover(userId, coverFile);
    setLocalCover(newUrl ?? coverPreview!);
    setCoverModalOpen(false);
    setCoverSaving(false);
  };

  /* ── About save ───────────────────────────────────── */
  const startEditAbout = () => {
    setDraftProfile({ ...profile });
    setEditingAbout(true);
  };

  const cancelEditAbout = () => {
    setEditingAbout(false);
    setAboutSaveError(null);
  };

  const saveAbout = async () => {
    setAboutSaving(true);
    setAboutSaveError(null);
    try {
      const updated = await updateUserProfile(userId!, draftProfile);
      // Sync state ONLY when server confirms success
      setProfile({
        bio: updated.bio ?? "",
        work: updated.work ?? "",
        location: updated.location ?? "",
        relationship: updated.relationshipStatus ?? "",
      });
      setEditingAbout(false);
    } catch (err) {
      // Keep edit mode open so user can retry; show the real error
      setAboutSaveError(
        err instanceof Error ? err.message : "Lưu thất bại, vui lòng thử lại.",
      );
    } finally {
      setAboutSaving(false);
    }
  };

  /* ── Post handlers ────────────────────────────────── */
  const handleToggleLike = async (
    id: string,
    reactionKey: ReactionKey | null,
  ) => {
    if (!currentUser.id) return;
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

  /* ── Photos extracted from posts ─────────────────── */
  const photoUrls = posts.flatMap((p) =>
    (p.media ?? []).filter((m) => m.type === "image").map((m) => m.url),
  );

  const tabs = [
    { key: "posts" as const, label: "Bài viết" },
    { key: "about" as const, label: "Giới thiệu" },
    {
      key: "photos" as const,
      label: `Ảnh${photoUrls.length ? ` (${photoUrls.length})` : ""}`,
    },
  ];

  const displayName =
    profileUser?.displayName ?? profileUser?.username ?? `User ${userId ?? ""}`;

  const shownAvatar = localAvatar ?? profileUser?.avatarUrl;
  const shownCover = localCover ?? profileUser?.coverUrl;

  return (
    <div className="bg-primary-50 w-full h-full overflow-y-auto">
      <div className="max-w-3xl mx-auto pb-10">
        {/* Cover Photo */}
        <div className="relative h-56 md:h-72 rounded-b-2xl overflow-hidden bg-linear-to-r from-purple-400 via-pink-500 to-red-500">
          {shownCover && (
            <img
              src={shownCover}
              alt="Ảnh bìa"
              className="size-full object-cover"
            />
          )}
          {isOwner && (
            <button
              onClick={openCoverModal}
              className="absolute bottom-20 right-4 bg-white px-4 py-2 rounded-lg flex items-center gap-2 hover:bg-gray-100 transition text-sm font-medium shadow">
              <Camera className="size-4" />
              <span className="hidden md:inline">Chỉnh sửa ảnh bìa</span>
            </button>
          )}
        </div>

        {/* Profile Info Card */}
        <div className="bg-white rounded-2xl mx-4 -mt-16 relative shadow-lg">
          <div className="p-6">
            {/* Avatar and Name */}
            <div className="flex flex-col md:flex-row items-center md:items-end gap-4">
              {/* Avatar */}
              <div className="relative -mt-20">
                <div className="size-32 md:size-40 rounded-full overflow-hidden border-4 border-white shadow-xl">
                  {shownAvatar ?
                    <img
                      src={shownAvatar}
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
                {isOwner && (
                  <button
                    onClick={openAvatarModal}
                    title="Đổi ảnh đại diện"
                    className="absolute bottom-2 right-2 bg-gray-200 p-2 rounded-full hover:bg-gray-300 transition shadow">
                    <Camera className="size-4" />
                  </button>
                )}
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
                {profile.bio && (
                  <p className="text-gray-500 mt-1 text-sm max-w-sm">
                    {profile.bio}
                  </p>
                )}
                <p className="text-gray-600 mt-1 text-sm">
                  <Users className="inline size-4 mr-1" />
                  {posts.length} bài viết
                </p>
              </div>

              <div className="flex gap-2 mb-4">
                {isOwner ?
                  <button
                    onClick={() => {
                      setActiveTab("about");
                      startEditAbout();
                    }}
                    className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium text-sm">
                    Chỉnh sửa trang cá nhân
                  </button>
                : <>
                    <button className="bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition font-medium text-sm">
                      Kết bạn
                    </button>
                    <button className="bg-gray-200 text-gray-800 px-6 py-2 rounded-lg hover:bg-gray-300 transition font-medium text-sm">
                      Nhắn tin
                    </button>
                  </>
                }
              </div>
            </div>

            {/* Quick bio row (non-edit mode) */}
            {(profile.work || profile.location || profile.relationship) && (
              <div className="mt-4 pt-4 border-t border-gray-100">
                <div className="flex flex-wrap gap-4">
                  {profile.work && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Briefcase className="size-4 text-gray-400" />
                      {profile.work}
                    </div>
                  )}
                  {profile.location && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <MapPin className="size-4 text-gray-400" />
                      {profile.location}
                    </div>
                  )}
                  {profile.relationship && (
                    <div className="flex items-center gap-1.5 text-sm text-gray-600">
                      <Heart className="size-4 text-gray-400" />
                      {profile.relationship}
                    </div>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* Navigation Tabs */}
          <div className="border-t border-gray-200">
            <div className="flex gap-2 px-6 overflow-x-auto">
              {tabs.map((tab) => (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key)}
                  className={`px-6 py-4 font-medium whitespace-nowrap transition text-sm ${
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

        {/* ── Tab content ────────────────────────────── */}
        <div className="px-4 mt-4 space-y-4">
          {/* POSTS tab */}
          {activeTab === "posts" &&
            (loading ?
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
              )))}

          {/* ABOUT tab */}
          {activeTab === "about" && (
            <div className="bg-white rounded-2xl p-6 shadow space-y-6">
              <div className="flex items-center justify-between">
                <h2 className="text-lg font-semibold text-gray-800">
                  Giới thiệu
                </h2>
                {isOwner && !editingAbout && (
                  <button
                    onClick={startEditAbout}
                    className="flex items-center gap-1.5 text-sm text-primary-500 hover:text-primary-700 font-medium">
                    <Pencil className="size-4" />
                    Chỉnh sửa
                  </button>
                )}
                {isOwner && editingAbout && (
                  <div className="flex items-center gap-2">
                    <button
                      onClick={saveAbout}
                      disabled={aboutSaving}
                      className="flex items-center gap-1 text-sm bg-primary-500 text-white px-3 py-1.5 rounded-lg hover:bg-primary-600 disabled:opacity-50 transition">
                      {aboutSaving ?
                        <Loader2 className="size-3.5 animate-spin" />
                      : <Check className="size-3.5" />}
                      Lưu
                    </button>
                    <button
                      onClick={cancelEditAbout}
                      className="flex items-center gap-1 text-sm bg-gray-200 text-gray-700 px-3 py-1.5 rounded-lg hover:bg-gray-300 transition">
                      <X className="size-3.5" />
                      Huỷ
                    </button>
                  </div>
                )}
              </div>

              {/* Error banner */}
              {aboutSaveError && (
                <div className="flex items-start gap-2 bg-red-50 border border-red-200 text-red-700 text-sm px-4 py-3 rounded-xl">
                  <X className="size-4 mt-0.5 shrink-0" />
                  <span>{aboutSaveError}</span>
                </div>
              )}

              {/* Bio */}
              <div>
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide mb-2">
                  Bio
                </p>
                {editingAbout ?
                  <textarea
                    rows={3}
                    className="w-full border border-gray-200 rounded-xl px-3 py-2 text-sm resize-none outline-none focus:ring-2 focus:ring-primary-300"
                    placeholder="Viết gì đó về bản thân..."
                    value={draftProfile.bio}
                    onChange={(e) =>
                      setDraftProfile((p) => ({ ...p, bio: e.target.value }))
                    }
                  />
                : <p
                    className={`text-sm ${!profile.bio ? "text-gray-400 italic" : "text-gray-700"}`}>
                    {profile.bio || "Chưa có mô tả."}
                  </p>
                }
              </div>

              {/* Fields */}
              <div className="space-y-4">
                <p className="text-xs font-semibold text-gray-400 uppercase tracking-wide">
                  Thông tin
                </p>
                <EditField
                  icon={<Briefcase className="size-4" />}
                  placeholder="Nơi làm việc..."
                  value={editingAbout ? draftProfile.work : profile.work}
                  editing={editingAbout}
                  onChange={(v) => setDraftProfile((p) => ({ ...p, work: v }))}
                />
                <EditField
                  icon={<MapPin className="size-4" />}
                  placeholder="Nơi ở hiện tại..."
                  value={
                    editingAbout ? draftProfile.location : profile.location
                  }
                  editing={editingAbout}
                  onChange={(v) =>
                    setDraftProfile((p) => ({ ...p, location: v }))
                  }
                />
                <EditField
                  icon={<Heart className="size-4" />}
                  placeholder="Tình trạng quan hệ..."
                  value={
                    editingAbout ?
                      draftProfile.relationship
                    : profile.relationship
                  }
                  editing={editingAbout}
                  onChange={(v) =>
                    setDraftProfile((p) => ({ ...p, relationship: v }))
                  }
                />
              </div>
            </div>
          )}

          {/* PHOTOS tab */}
          {activeTab === "photos" && (
            <div className="bg-white rounded-2xl p-6 shadow">
              <h2 className="text-lg font-semibold text-gray-800 mb-4">Ảnh</h2>
              {loading ?
                <div className="flex justify-center py-10">
                  <Loader2 className="size-6 animate-spin text-primary-400" />
                </div>
              : photoUrls.length === 0 ?
                <div className="flex flex-col items-center py-12 text-gray-400 gap-3">
                  <ImageIcon className="size-12 opacity-40" />
                  <p className="text-sm">Chưa có ảnh nào</p>
                </div>
              : <div className="grid grid-cols-3 gap-1.5">
                  {photoUrls.map((url, i) => (
                    <div
                      key={i}
                      className="aspect-square overflow-hidden rounded-xl cursor-pointer group relative">
                      <img
                        src={url}
                        alt=""
                        className="size-full object-cover transition group-hover:scale-105 duration-200"
                      />
                    </div>
                  ))}
                </div>
              }
            </div>
          )}
        </div>
      </div>

      {/* ── Avatar Edit Modal ──────────────────────── */}
      {avatarModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setAvatarModalOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-sm p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Đổi ảnh đại diện
              </h3>
              <button
                onClick={() => setAvatarModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition">
                <X className="size-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="flex justify-center">
              <div className="size-36 rounded-full overflow-hidden border-4 border-primary-100 shadow">
                {avatarPreview ?
                  <img
                    src={avatarPreview}
                    alt="preview"
                    className="size-full object-cover"
                  />
                : shownAvatar ?
                  <img
                    src={shownAvatar}
                    alt="current"
                    className="size-full object-cover"
                  />
                : <img
                    src={avatar}
                    alt="default"
                    className="size-full object-cover"
                  />
                }
              </div>
            </div>

            {/* File input trigger */}
            <input
              ref={avatarInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarFileChange}
            />
            <button
              onClick={() => avatarInputRef.current?.click()}
              className="w-full border-2 border-dashed border-primary-300 text-primary-500 font-medium py-2.5 rounded-xl hover:bg-primary-50 transition text-sm flex items-center justify-center gap-2">
              <Camera className="size-4" />
              Chọn ảnh từ thiết bị
            </button>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setAvatarModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
                Huỷ
              </button>
              <button
                onClick={handleAvatarSave}
                disabled={!avatarFile || avatarSaving}
                className="flex-1 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-40 transition flex items-center justify-center gap-1.5">
                {avatarSaving ?
                  <Loader2 className="size-4 animate-spin" />
                : <Check className="size-4" />}
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}

      {/* ── Cover Edit Modal ────────────────────────────── */}
      {coverModalOpen && (
        <div
          className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4"
          onClick={() => setCoverModalOpen(false)}>
          <div
            className="bg-white rounded-2xl shadow-xl w-full max-w-lg p-6 space-y-4"
            onClick={(e) => e.stopPropagation()}>
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Đổi ảnh bìa
              </h3>
              <button
                onClick={() => setCoverModalOpen(false)}
                className="text-gray-400 hover:text-gray-600 transition">
                <X className="size-5" />
              </button>
            </div>

            {/* Preview */}
            <div className="w-full h-40 rounded-xl overflow-hidden border border-primary-100 shadow bg-linear-to-r from-purple-400 via-pink-500 to-red-500">
              {(coverPreview ?? shownCover) && (
                <img
                  src={coverPreview ?? shownCover!}
                  alt="preview"
                  className="size-full object-cover"
                />
              )}
            </div>

            {/* File input trigger */}
            <input
              ref={coverInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleCoverFileChange}
            />
            <button
              onClick={() => coverInputRef.current?.click()}
              className="w-full border-2 border-dashed border-primary-300 text-primary-500 font-medium py-2.5 rounded-xl hover:bg-primary-50 transition text-sm flex items-center justify-center gap-2">
              <Camera className="size-4" />
              Chọn ảnh từ thiết bị
            </button>

            {/* Actions */}
            <div className="flex gap-2 pt-1">
              <button
                onClick={() => setCoverModalOpen(false)}
                className="flex-1 py-2 rounded-xl bg-gray-100 text-gray-700 text-sm font-medium hover:bg-gray-200 transition">
                Huỷ
              </button>
              <button
                onClick={handleCoverSave}
                disabled={!coverFile || coverSaving}
                className="flex-1 py-2 rounded-xl bg-primary-500 text-white text-sm font-medium hover:bg-primary-600 disabled:opacity-40 transition flex items-center justify-center gap-1.5">
                {coverSaving ?
                  <Loader2 className="size-4 animate-spin" />
                : <Check className="size-4" />}
                Lưu
              </button>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SocialProfile;
