// @/services/auth.service.ts

import {AuthApiClient, authApiClient} from "@/auth/auth.api.client";
import {parseJwt} from "@/utils/jwtUtils";
import {TokensRepository} from "@/data/TokensRepository";
import {LogoutRequest, TokensResponse} from "@/auth/auth.dto";
import useUserStore, {UserStore} from "@/store/userStore";
import {checkAuth} from "@/auth/auth.check";
import {normalizeApiError} from "@/feedback/api-error";
import {sessionExpiryHandler} from "@/auth/session-expiry";

export class AuthService {
    constructor(
        private readonly authApiClient: AuthApiClient,
        private readonly getUserState: () => UserStore,
    ) {
    }

    async login(email: string, password: string, rememberMe: boolean): Promise<void> {
        try {
            const response = await this.authApiClient.login({username: email, password: password, rememberMe: rememberMe});
            if (response.status === 200) {
                this.parseAndSaveTokens(response.data)
                sessionExpiryHandler.reset();
                return;
            }
            throw new Error("Unexpected authentication response");
        } catch (error) {
            throw normalizeApiError(error);
        }
    }

    async checkAuth() {
        await checkAuth();
    }

    async logout() {
        try {
            const payload: LogoutRequest = { refreshToken: TokensRepository.getRefreshToken() || '' }
            await this.authApiClient.logout(payload);
        } catch (error) {
            throw normalizeApiError(error);
        } finally {
            TokensRepository.clearTokens();
            this.getUserState().clearAuth();
        }
    }

    private parseAndSaveTokens(tokens: TokensResponse) {
        const {access_token: accessToken, refresh_token: refreshToken} = tokens
        const payload = parseJwt(accessToken)
        if (payload) {
            TokensRepository.setTokens(accessToken, refreshToken);
            this.getUserState().setAuth(payload.sub, payload.email, payload.realm_access.roles);
        } else {
            throw new Error("Unable to parse JWT token")
        }
    }
}

export const authService = new AuthService(
    authApiClient,
    useUserStore.getState
);
