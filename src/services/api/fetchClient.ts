export const authFetch = (input: RequestInfo | URL, init: RequestInit = {}) => {
    const token = localStorage.getItem("accessToken");
    const headers = new Headers(init.headers ?? undefined);

    if (token && !headers.has("Authorization")) {
        headers.set("Authorization", `Bearer ${token}`);
    }

    return fetch(input, {
        ...init,
        headers,
    });
};
