import KeycloakProvider from "next-auth/providers/keycloak";
import NextAuth, {Account, AuthOptions, getServerSession, Session} from "next-auth";
import {refreshKeycloakToken} from "@/sample/auth/auth.api.keycloak";

function parseRoles(accessToken?: string) {
    let roles: string[] = [];
    if (accessToken) {
        const payload = JSON.parse(
            Buffer.from(accessToken.split(".")[1], "base64").toString()
        );

        roles = payload.realm_access?.roles ?? [];
    }
    return roles;
}

export const authOptions = {
    providers: [
        KeycloakProvider({
            clientId: process.env.KEYCLOAK_ID!,
            clientSecret: process.env.KEYCLOAK_SECRET!,
            issuer: process.env.KEYCLOAK_ISSUER,
        })
        // ...add more providers here
    ],
    callbacks: {
        async jwt({ token, account }) {
            console.log("Auth [jwt callback] - start")
            if (account) {
                // First-time login, save the `access_token`, its expiry and the `refresh_token`
                console.log("Auth [jwt callback] - account branch")
                const roles = parseRoles(account.access_token);

                console.log("Auth [jwt callback] - account", account)

                return {
                    ...token,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    refresh_token: account.refresh_token,
                    realm_roles: roles
                }
            } else if (Date.now() < token.expires_at * 1000) {
                // Subsequent logins, but the `access_token` is still valid
                console.log("Auth [jwt callback] - token not expired branch")
                return token
            } else {
                // Subsequent logins, but the `access_token` has expired, try to refresh it
                console.log("Auth [jwt callback] - refresh token branch")
                // if (!token.refresh_token || token.error) throw new TypeError(`Missing refresh_token ${token.refresh_token} || ${token.error}`)
                if (!token.refresh_token) throw new TypeError(`Missing refresh_token ${token.refresh_token} || ${token.error}`)

                console.log(`Auth [jwt callback] - Refresh token for refreshing: ${token.refresh_token}`)

                try {
                    // The `token_endpoint` can be found in the provider's documentation. Or if they support OIDC,
                    // at their `/.well-known/openid-configuration` endpoint.
                    // i.e. https://accounts.google.com/.well-known/openid-configuration
                    const response = await refreshKeycloakToken(token)

                    console.log(`Auth [jwt callback] - response status from refresh: ${response.status}`)

                    if (response.status !== 200) throw response

                    const newTokens = response.data

                    console.log(`Auth [jwt callback] - Refreshing tokens result: ${newTokens.access_token} ${newTokens.refresh_token}`)

                    const roles = parseRoles(newTokens.access_token);

                    return {
                        ...token,
                        access_token: newTokens.access_token,
                        expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
                        // Some providers only issue refresh tokens once, so preserve if we did not get a new one
                        refresh_token: newTokens.refresh_token,
                        realm_roles: roles
                    }
                } catch (error) {
                    console.error("Error refreshing access_token", error)
                    // If we fail to refresh the token, return an error so we can handle it on the page
                    token.error = "RefreshTokenError"

                    return token
                }
            }
        },
        async session({ session, token, user }) {
            // Send properties to the client, like an access_token from a provider.
            console.log("Auth [session callback] - start")
            if (token.error) {
                console.log("Auth [session callback] - token.error -> null")
                return null
            }

            session.accessToken = token.access_token
            session.error = token.error
            session.realmRoles = token.realm_roles || []
            console.log("Auth [session callback] - return session")
            return session
        }
    }
} as AuthOptions

// export const auth = NextAuth(authOptions)

export async function getAuthSession(
    timeoutMs = 3000
): Promise<Session | null> {
    try {
        return await Promise.race([
            getServerSession(authOptions),
            new Promise<null>((_, reject) =>
                setTimeout(() => reject(new Error("Auth timeout")), timeoutMs)
            ),
        ]);
    } catch (error) {
        console.error("[AUTH] getServerSession failed:", error);
        return null;
    }
}