import {AxiosInstance, AxiosResponse} from "axios";
import {LoginRequest, LogoutRequest, RefreshTokenRequest, TokensResponse} from "@/auth/auth.dto";
import {axiosKeycloakClient} from "@/auth/auth.api.client.config";

const keycloakClientId = process.env.NEXT_PUBLIC_KEYCLOAK_ID!

export class AuthApiClient {
    private readonly client: AxiosInstance;

    constructor(clientInstance: AxiosInstance) {
        this.client = clientInstance;
    }

    async login(payload: LoginRequest): Promise<AxiosResponse<TokensResponse>> {
        const defaultParams = {
            client_id: keycloakClientId,
            grant_type: "password",
            username: payload.username,
            password: payload.password,
        }

        const params = payload.rememberMe
            ? new URLSearchParams({
                ...defaultParams,
                scope: "offline_access"
            })
            : new URLSearchParams(defaultParams)

        return this.client.post(
            "/protocol/openid-connect/token",
            params.toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )
    }

    async refresh(payload: RefreshTokenRequest): Promise<AxiosResponse<TokensResponse>> {
        return this.client.post(
            "/protocol/openid-connect/token",
            new URLSearchParams({
                client_id: keycloakClientId,
                grant_type: "refresh_token",
                refresh_token: payload.refreshToken
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        )
    }

    // async register(payload: RegisterRequest): Promise<AxiosResponse<TokensResponse>> {
    //     return this.client.post("/api/v1/auth/register", payload);
    // }

    async logout(payload: LogoutRequest): Promise<AxiosResponse<void>> {
        return this.client.post(
            "/protocol/openid-connect/logout",
            new URLSearchParams({
                client_id: keycloakClientId,
                refresh_token: payload.refreshToken
            }).toString(),
            {
                headers: {
                    'Content-Type': 'application/x-www-form-urlencoded'
                }
            }
        );
    }
}

export const authApiClient = new AuthApiClient(axiosKeycloakClient)