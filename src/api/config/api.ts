import axios, {
    AxiosError,
    AxiosInstance,
    AxiosRequestConfig,
    AxiosRequestHeaders,
    InternalAxiosRequestConfig,
} from "axios";
import {apiBaseUrl} from "@/constants/urls";
import {tokenService} from "@/auth/auth.tokens.service";

const baseUrl = apiBaseUrl;

class AxiosInterceptor {
    readonly axiosInstance: AxiosInstance;

    constructor(instanceConfig: AxiosRequestConfig = {}) {
        this.axiosInstance = axios.create(instanceConfig);

        // request interceptor
        this.axiosInstance.interceptors.request.use((config: InternalAxiosRequestConfig & { skipAuth?: boolean }) => {
            const token = tokenService.getAccessToken();
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
                console.log("Axios interceptor. Error:", error)
                const originalRequest = error.config as any;

                if (error.response?.status === 401 && !originalRequest._retry) {
                    originalRequest._retry = true;

                    try {
                        const newToken = await tokenService.refresh();
                        originalRequest.headers.Authorization = `Bearer ${newToken}`;
                        return this.axiosInstance(originalRequest);
                    } catch (err) {
                        return Promise.reject(err);
                    }
                }

                return Promise.reject(error);
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