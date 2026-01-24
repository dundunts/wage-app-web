import {JWT} from "next-auth/jwt";

const baseUrl = process.env.KEYCLOAK_URL!

const realm = process.env.KEYCLOAK_REALM!

const tokenUrl = `${baseUrl}/realms/${realm}/protocol/openid-connect/token`

export async function refreshKeycloakToken(token: JWT): Promise<Response> {
    return fetch(tokenUrl, {
        method: "POST",
        body: new URLSearchParams({
            client_id: process.env.KEYCLOAK_ID!,
            client_secret: process.env.KEYCLOAK_SECRET!,
            grant_type: "refresh_token",
            refresh_token: token.refresh_token!,
        }),
    })
}