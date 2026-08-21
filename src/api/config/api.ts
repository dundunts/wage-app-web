import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosRequestHeaders,
    InternalAxiosRequestConfig,
} from "axios";
import {apiBaseUrl} from "@/constants/urls";
import {tokenService} from "@/auth/auth.tokens.service";
import {normalizeApiError} from "@/feedback/api-error";
import type {ApplicationError} from "@/feedback/api-error";
import {sessionExpiryHandler} from "@/auth/session-expiry";

type RetryableRequest = InternalAxiosRequestConfig & { _retry?: boolean };

const baseUrl = apiBaseUrl;

interface TokenBoundary {
    getAccessToken(): string | null;
    refresh(): Promise<string>;
}

interface SessionExpiryBoundary {
    handle(refreshError: unknown): ApplicationError;
}

export class AxiosInterceptor {
    readonly axiosInstance: AxiosInstance;

    constructor(
        instanceConfig: AxiosRequestConfig = {},
        private readonly tokenBoundary: TokenBoundary = tokenService,
        private readonly sessionExpiryBoundary: SessionExpiryBoundary = sessionExpiryHandler,
    ) {
        this.axiosInstance = axios.create(instanceConfig);

        // request interceptor
        this.axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig & { skipAuth?: boolean }) => {
            const token = this.tokenBoundary.getAccessToken();
            if (token && !config.skipAuth) {
                config.headers = {
                    ...config.headers,
                    Authorization: `Bearer ${token}`
                } as AxiosRequestHeaders;
            }
            return config;
        });

        // response interceptor
        this.axiosInstance.interceptors.response.use(
            resp => resp,
            async (error: AxiosError) => {
                const originalRequest = error.config as RetryableRequest | undefined;

                if (error.response?.status === 401 && originalRequest && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const newToken = await this.tokenBoundary.refresh();
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return this.axiosInstance(originalRequest);
                    } catch (err) {
                        const sessionError = this.sessionExpiryBoundary.handle(err);
                        return Promise.reject(sessionError);
                    }
                }

                return Promise.reject(normalizeApiError(error));
            }
        );
    }
}

// готовый клиент
export const axiosBackendClient = new AxiosInterceptor({
    baseURL: baseUrl,
}).axiosInstance;

export const serverClient = axios.create({
    baseURL: baseUrl,
})
