import "@fontsource-variable/manrope";
import {AuthSessionProvider} from "./providers/session-provider";
import {Provider} from "@/components/ui/provider";
import {Header} from "@/components/navigation/Header";
import AuthInitializer from "@/components/auth/AuthInitializer";
import {Suspense} from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import RouteSecurity from "@/components/auth/RouteSecurity";
import SessionExpiryBoundary from "@/components/auth/SessionExpiryBoundary";

export default function RootLayout({children}: { children: React.ReactNode; }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body>
        <Provider defaultTheme={'dark'}>
            <SessionExpiryBoundary/>
            <AuthInitializer/>
            {children}
        </Provider>
        </body>
        </html>
    );
}
