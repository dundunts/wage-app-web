// @/api/dto/auth.dto.ts

export interface TokensResponse {
    access_token: string;
    expires_in: number;
    refresh_expires_in: number;
    refresh_token: string;
    token_type: string;
    session_state: string;
    scope: string;
}

export interface RefreshTokenRequest {
    refreshToken: string;
}

export interface LoginRequest {
    username: string;
    password: string;
    rememberMe: boolean;
}

export interface LogoutRequest {
    refreshToken: string;
}