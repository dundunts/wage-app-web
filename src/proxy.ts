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

const IGNORED_PATHS = [
    "/_next",
    "/api/auth",
    "/favicon.ico",
    "/robots.txt",
    "/sitemap.xml",
];

function isIgnoredPath(pathname: string) {
    return IGNORED_PATHS.some(path => pathname.startsWith(path));
}

export async function proxy(request: NextRequest) {
    const pathname = request.nextUrl.pathname;

    if (isIgnoredPath(pathname)) return NextResponse.next();

    const session = await getAuthSession();

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