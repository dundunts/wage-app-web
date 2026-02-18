import {TokensRepository} from "@/data/TokensRepository";
import axios from "axios";
import {TokensResponse} from "@/auth/auth.dto";
import {apiBaseUrl} from "@/constants/urls";
import {authApiClient} from "@/auth/auth.api.client";

class TokenService {
    private isRefreshing = false;
    private refreshPromise: Promise<string> | null = null;
    private subscribers: ((token: string) => void)[] = [];

    getAccessToken() {
        return TokensRepository.getAccessToken();
    }

    getRefreshToken() {
        return TokensRepository.getRefreshToken();
    }

    subscribe(callback: (token: string) => void) {
        this.subscribers.push(callback);
    }

    notify(token: string) {
        this.subscribers.forEach(cb => cb(token));
        this.subscribers = [];
    }

    async refresh(): Promise<string> {
        if (this.refreshPromise) {
            // уже идёт refresh → ждём его
            return this.refreshPromise;
        }

        this.isRefreshing = true;

        const refreshToken = this.getRefreshToken();
        if (!refreshToken) {
            TokensRepository.clearTokens();
            throw new Error("No refresh token");
        }

        this.refreshPromise = authApiClient.refresh({refreshToken})
            .then((res) => {
                const { access_token: accessToken, refresh_token: refreshToken } = res.data;
                TokensRepository.setTokens(accessToken, refreshToken);
                this.notify(accessToken);
                return accessToken;
            })
            .catch((err) => {
                TokensRepository.clearTokens();
                throw err;
            })
            .finally(() => {
                this.isRefreshing = false;
                this.refreshPromise = null;
            });

        return this.refreshPromise;
    }
}

export const tokenService = new TokenService();
