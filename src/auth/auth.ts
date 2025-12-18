import KeycloakProvider from "next-auth/providers/keycloak";
import NextAuth, {Account, AuthOptions, getServerSession, Session} from "next-auth";
import {refreshKeycloakToken} from "@/auth/auth.api.keycloak";

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
            if (account) {
                // First-time login, save the `access_token`, its expiry and the `refresh_token`
                const roles = parseRoles(account.access_token);

                return {
                    ...token,
                    access_token: account.access_token,
                    expires_at: account.expires_at,
                    refresh_token: account.refresh_token,
                    realm_roles: roles
                }
            } else if (Date.now() < token.expires_at * 1000) {
                // Subsequent logins, but the `access_token` is still valid
                return token
            } else {
                // Subsequent logins, but the `access_token` has expired, try to refresh it
                if (!token.refresh_token) throw new TypeError("Missing refresh_token")

                try {
                    // The `token_endpoint` can be found in the provider's documentation. Or if they support OIDC,
                    // at their `/.well-known/openid-configuration` endpoint.
                    // i.e. https://accounts.google.com/.well-known/openid-configuration
                    const response = await refreshKeycloakToken(token)

                    const tokensOrError = await response.json()

                    if (!response.ok) throw tokensOrError

                    const newTokens = tokensOrError as {
                        access_token: string
                        expires_in: number
                        refresh_token?: string
                    }

                    const roles = parseRoles(newTokens.access_token);

                    return {
                        ...token,
                        access_token: newTokens.access_token,
                        expires_at: Math.floor(Date.now() / 1000 + newTokens.expires_in),
                        // Some providers only issue refresh tokens once, so preserve if we did not get a new one
                        refresh_token: newTokens.refresh_token
                            ? newTokens.refresh_token
                            : token.refresh_token,
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
            session.accessToken = token.access_token
            session.error = token.error
            session.realmRoles = token.realm_roles || []
            return session
        }
    }
} as AuthOptions

export const auth = NextAuth(authOptions)

export async function getAuthSession(): Promise<Session | null> {
    return getServerSession(authOptions)
}