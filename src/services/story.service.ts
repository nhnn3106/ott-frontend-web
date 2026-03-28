import { API_MEDIA_SERVER_URL } from "../config/api.config";
import type { StoryItem } from "../components/social/types";

export interface ApiStory {
    id: string;
    accountId: string;
    accountUsername: string;
    accountDisplayName: string | null;
    accountAvatarUrl: string | null;
}

export interface StoryCreateRequest {
    userId: string;
    visibility?: string;
    isHighlight?: boolean;
    highlightName?: string | null;
    expireAt?: string | null;
    storyItems?: unknown[];
    musics?: unknown[];
    hashTags?: string[];
    accessControls?: unknown[];
    mentions?: unknown[];
}

function unwrapList<T>(json: unknown): T[] {
    if (Array.isArray(json)) return json as T[];
    const obj = json as Record<string, unknown>;
    if (Array.isArray(obj.value)) return obj.value as T[];
    return [];
}

export async function fetchStories(): Promise<StoryItem[]> {
    try {
        const res = await fetch(`${API_MEDIA_SERVER_URL}/stories`, {
            // signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) return [];
        const raw = unwrapList<ApiStory>(await res.json());
        return raw.map((story) => ({
            id: story.id,
            name: story.accountDisplayName ?? story.accountUsername,
            isBirthday: false,
        }));
    } catch {
        return [];
    }
}

export async function createStory(request: StoryCreateRequest): Promise<ApiStory | null> {
    try {
        const res = await fetch(`${API_MEDIA_SERVER_URL}/stories`, {
            method: "POST",
            headers: { "Content-Type": "application/json" },
            body: JSON.stringify(request),
            signal: AbortSignal.timeout(10_000),
        });
        if (!res.ok) return null;
        return (await res.json()) as ApiStory;
    } catch {
        return null;
    }
}
