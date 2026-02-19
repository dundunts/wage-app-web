// @/services/auth.service.ts

import {AuthApiClient, authApiClient} from "@/auth/auth.api.client";
import {parseJwt} from "@/utils/jwtUtils";
import {TokensRepository} from "@/data/TokensRepository";
import {LogoutRequest, TokensResponse} from "@/auth/auth.dto";
import useUserStore, {UserStore} from "@/store/userStore";
import {checkAuth} from "@/auth/auth.check";

class AuthService {
    constructor(
        private readonly authApiClient: AuthApiClient,
        private readonly getUserState: () => UserStore,
    ) {
    }

    async login(email: string, password: string, rememberMe: boolean): Promise<boolean> {
        try {
            const response = await this.authApiClient.login({username: email, password: password, rememberMe: rememberMe});
            if (response.status === 200) {
                this.parseAndSaveTokens(response.data)
                return true;
            }
            console.log('Bad response status for authentication', response);
            return false;
        } catch (e) {
            console.log("Error in auth")
            console.log(e)
            return false;
        }
    }

    async checkAuth() {
        await checkAuth();
    }

    async logout() {
        try {
            const payload: LogoutRequest = { refreshToken: TokensRepository.getRefreshToken() || '' }
            await this.authApiClient.logout(payload);
            this.getUserState().clearAuth()
        } catch (e) {
            console.log("Error in logout")
            console.log(e)
        }
    }

    private parseAndSaveTokens(tokens: TokensResponse) {
        const {access_token: accessToken, refresh_token: refreshToken} = tokens
        const payload = parseJwt(accessToken)
        if (payload) {
            TokensRepository.setTokens(accessToken, refreshToken);
            this.getUserState().setAuth(payload.sub, payload.email, payload.resource_access.account.roles);
        } else {
            throw new Error("Unable to parse JWT token")
        }
    }
}

export const authService = new AuthService(
    authApiClient,
    useUserStore.getState
);
