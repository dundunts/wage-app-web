// services/TokenRepository.ts

// services/tokenService.ts
const ACCESS_TOKEN_KEY = "access_token";
const REFRESH_TOKEN_KEY = "refresh_token";

export const TokensRepository = {
    getAccessToken(): string | null {
        // if (typeof window === "undefined") return null;
        return localStorage.getItem(ACCESS_TOKEN_KEY);
    },

    setAccessToken(token: string) {
        // if (typeof window === "undefined") return;
        localStorage.setItem(ACCESS_TOKEN_KEY, token);
    },

    clearAccessToken() {
        // if (typeof window === "undefined") return;
        localStorage.removeItem(ACCESS_TOKEN_KEY);
    },

    getRefreshToken(): string | null {
        // if (typeof window === "undefined") return null;
        return localStorage.getItem(REFRESH_TOKEN_KEY);
    },

    setRefreshToken(token: string) {
        // if (typeof window === "undefined") return;
        localStorage.setItem(REFRESH_TOKEN_KEY, token);
    },

    clearRefreshToken() {
        // if (typeof window === "undefined") return;
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },

    setTokens(accessToken: string, refreshToken: string) {
        // if (typeof window === "undefined") return;
        localStorage.setItem(ACCESS_TOKEN_KEY, accessToken);
        localStorage.setItem(REFRESH_TOKEN_KEY, refreshToken);
    },

    clearTokens() {
        // if (typeof window === "undefined") return;
        localStorage.removeItem(ACCESS_TOKEN_KEY);
        localStorage.removeItem(REFRESH_TOKEN_KEY);
    },
};
