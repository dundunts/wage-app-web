import {JWT} from "next-auth/jwt";
import axios, {AxiosResponse} from "axios";

const baseUrl = process.env.KEYCLOAK_URL!

const realm = process.env.KEYCLOAK_REALM!

const tokenUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/token`

const axiosInstance = axios.create({
    baseURL: baseUrl,
    headers: {
        "Content-Type": "application/json",
    },
});

export interface TokenResponse {
    access_token: string
    expires_in: number
    refresh_token: string
}

export async function refreshKeycloakToken(token: JWT): Promise<AxiosResponse<TokenResponse>> {
    return axiosInstance.post(`/realms/${realm}/protocol/openid-connect/token`,
        new URLSearchParams({
            client_id: process.env.KEYCLOAK_ID!,
            client_secret: process.env.KEYCLOAK_SECRET!,
            grant_type: "refresh_token",
            refresh_token: token.refresh_token!,
        }).toString(),
        {
            headers: {
                'Content-Type': 'application/x-www-form-urlencoded'
            }
        }
    )
    // return fetch(tokenUrl, {
    //     method: "POST",
    //     body: new URLSearchParams({
    //         client_id: process.env.KEYCLOAK_ID!,
    //         client_secret: process.env.KEYCLOAK_SECRET!,
    //         grant_type: "refresh_token",
    //         refresh_token: token.refresh_token!,
    //     }),
    // })
}