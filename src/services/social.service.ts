/**
 * social.service.ts
 * Các thao tác liên quan đến User (account).
 * Bài post → xem post.service.ts
 */

import { API_MEDIA_SERVER_URL } from "../config/api.config";

/* ─── Raw shape trả về từ backend ────────────────────── */
export interface ApiUser {
    id: string;
    username: string;
    displayName: string;
    avatarUrl: string | null;
}

/* ─── Public API ──────────────────────────────────────── */

/**
 * Fetch tất cả users từ DB.
 * Trả về mảng rỗng nếu backend không khả dụng.
 */
export async function fetchUsers(): Promise<ApiUser[]> {
    try {
        const res = await fetch(`${API_MEDIA_SERVER_URL}/users`, {
            signal: AbortSignal.timeout(5_000),
        });
        if (!res.ok) return [];
        const json = await res.json();
        return Array.isArray(json) ? json : ((json.value ?? []) as ApiUser[]);
    } catch {
        return [];
    }
}

/**
 * Lấy user theo username từ DB.
 * Trả về null nếu không tìm thấy hoặc backend không khả dụng.
 */
export async function fetchUserByUsername(username: string): Promise<ApiUser | null> {
    try {
        const res = await fetch(
            `${API_MEDIA_SERVER_URL}/users/username/${username}`,
            { signal: AbortSignal.timeout(5_000) },
        );
        if (!res.ok) return null;
        return (await res.json()) as ApiUser;
    } catch {
        return null;
    }
}
