import {NextRequest, NextResponse} from "next/server";
import {getAuthSession} from "@/auth/auth";

const loginUrl = "/api/auth/signin"

interface SecureRoute {
    pattern: RegExp,
    requiredRoles: string[]
}

const securedEndpoints: SecureRoute[] = [
    { pattern: /^\/secured(\/.*)?$/, requiredRoles: [] },
    { pattern: /^\/admin(\/.*)?$/, requiredRoles: ["admin"] },
]

export async function proxy(request: NextRequest) {
    const session = await getAuthSession();
    const pathname = request.nextUrl.pathname;

    for (const route of securedEndpoints) {
        if (route.pattern.test(pathname)) {
            // не авторизован
            if (!session) {
                return NextResponse.redirect(new URL(loginUrl, request.url));
            }

            // проверка ролей
            if (
                route.requiredRoles.length > 0 &&
                !route.requiredRoles.every(role =>
                    session.realmRoles?.includes(role)
                )
            ) {
                return NextResponse.redirect(new URL("/403", request.url));
            }
        }
    }

    return NextResponse.next();
}