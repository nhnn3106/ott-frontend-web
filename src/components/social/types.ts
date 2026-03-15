export interface PostMediaItem {
    type: "image" | "video";
    url: string;
}

export interface User {
    id: string;
    name: string;
    avatar?: string;
    color: string;
}

export interface Post {
    id: string;
    author: User;
    time: string;
    content: string;
    media: PostMediaItem[];
    likes: number;
    comments: number;
    shares: number;
    visibility?: string;
    relationship?: "self" | "friend" | "friend-of-friend" | "stranger";
    relationshipLabel?: string;
}

export interface StoryItem {
    id: string;
    name: string;
    isBirthday: boolean;
}

export interface FriendRequest {
    id: string;
    name: string;
    mutualFriends: number;
    time: string;
}
