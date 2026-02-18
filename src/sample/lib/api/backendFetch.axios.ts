import axios, {AxiosRequestConfig, AxiosResponse} from "axios";
import {getAuthSession} from "@/sample/auth/auth";
import * as http from "node:http";
import * as https from "node:https";

const BACKEND_URL = process.env.BACKEND_URL ?? "http://92.255.107.65:8085";

const axiosInstance = axios.create({
    baseURL: process.env.BACKEND_URL, // Убедитесь, что переменная есть
    headers: {
        "Content-Type": "application/json",
        // Явно просим сервер закрывать соединение
        "Connection": "close",
    },
    // Отключаем keepAlive на уровне Node агента
    httpAgent: new http.Agent({ keepAlive: false }),
    httpsAgent: new https.Agent({ keepAlive: false }),
    // Обязательно добавьте таймаут, чтобы не висеть вечно
    timeout: 10000,
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
        const promise = axiosInstance({
            url: url,
            ...config,
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
                ...config.headers,
            },
        });

        promise.then(res => {
            console.log(`Backend fetch success: ${res.status}`);
        }).catch(err => {
            console.error(`Backend fetch failed: ${err.message}`);
        });

        return promise;
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