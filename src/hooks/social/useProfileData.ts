import { useState, useEffect } from "react";
import type { Post, PostUser } from "../../components/social/types";
import type { UserProfile } from "../../services/social.service";
import {
  fetchUsers,
  fetchUserById,
} from "../../services/social.service";
import {
  fetchPostsByUser,
  fetchUserReactions,
  fetchPostReactions,
} from "../../services/post.service";

const AVATAR_COLORS = [
  "bg-primary-500",
  "bg-emerald-500",
  "bg-rose-500",
  "bg-amber-500",
  "bg-violet-500",
  "bg-sky-500",
];

interface ProfileUser {
  displayName: string;
  username: string;
  avatarUrl?: string;
  coverUrl?: string;
}

export const useProfileData = (userId: string | undefined) => {
  const [profileUser, setProfileUser] = useState<ProfileUser | null>(null);
  const [currentUser, setCurrentUser] = useState<PostUser>({
    id: "",
    name: "Người dùng",
    displayName: "Người dùng",
    color: "bg-primary-500",
  });
  const [profile, setProfile] = useState<UserProfile>({
    bio: "",
    work: "",
    location: "",
    relationship: "",
  });
  const [posts, setPosts] = useState<Post[]>([]);
  const [userReactionMap, setUserReactionMap] = useState<Record<string, string>>({});
  const [postReactionCountsMap, setPostReactionCountsMap] = useState<
    Record<string, Record<string, number>>
  >({});
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (!userId) return;

    (async () => {
      setLoading(true);

      // Fetch users
      const users = await fetchUsers();
      const me = users[0];

      if (me) {
        setCurrentUser({
          id: me.id,
          name: me.displayName ?? me.username,
          displayName: me.displayName,
          avatar: me.avatarUrl ?? undefined,
          color: AVATAR_COLORS[0],
        });
      }

      // Fetch profile user
      const prof = users.find((u) => u.id === userId);
      if (prof) {
        setProfileUser({
          displayName: prof.displayName,
          username: prof.username,
          avatarUrl: prof.avatarUrl ?? undefined,
          coverUrl: prof.coverUrl ?? undefined,
        });
      }

      // Load full profile fields
      const full = await fetchUserById(userId);
      if (full) {
        setProfile({
          bio: full.bio ?? "",
          work: full.work ?? "",
          location: full.location ?? "",
          relationship: full.relationshipStatus ?? "",
        });
      }

      // Load posts
      const userPosts = await fetchPostsByUser(userId, me?.id);
      setPosts(userPosts);

      // Load post reactions
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

      // Load user reactions
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

  return {
    profileUser,
    currentUser,
    profile,
    setProfile,
    posts,
    setPosts,
    userReactionMap,
    setUserReactionMap,
    postReactionCountsMap,
    loading,
  };
};
