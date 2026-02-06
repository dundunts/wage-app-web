import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {getAuthSession} from "@/auth/auth";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://92.255.107.65:8085";

const axiosInstance = axios.create({
    baseURL: BACKEND_URL,
    headers: {
        "Content-Type": "application/json",
    },
});

export async function backendFetch<T>(
    url: string,
    config: AxiosRequestConfig = {}
): Promise<AxiosResponse<T>> {
    const session = await getAuthSession();

    if (!session?.accessToken) {
        throw new Error("Unauthorized");
    }

    console.log(`Access token: ${session.accessToken}`);

    try {
        return await axiosInstance({
            url: url,
            ...config,
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                // Имитация cache: 'no-store' через HTTP заголовки,
                // так как Axios не поддерживает нативный флаг Next.js
                "Cache-Control": "no-store, no-cache, must-revalidate",
                Pragma: "no-cache",
                Expires: "0",
                ...config.headers,
            },
        });
    } catch (error) {
        if (axios.isAxiosError(error) && error.response) {
            // Пытаемся достать текст ошибки так же, как вы делали это с response.text()
            // Axios автоматически парсит JSON, поэтому error.response.data может быть объектом
            const errorData = error.response.data;

            const errorMessage = typeof errorData === 'object'
                ? JSON.stringify(errorData)
                : String(errorData || error.response.statusText);

            throw new Error(errorMessage);
        }

        // Пробрасываем остальные ошибки (сеть и т.д.)
        throw error;
    }
}