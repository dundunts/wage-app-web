import "./globals.css";
import {AuthSessionProvider} from "./providers/session-provider";
import {Provider} from "@/components/ui/provider";
import {Header} from "@/components/navigation/Header";
import AuthInitializer from "@/components/auth/AuthInitializer";
import {Suspense} from "react";
import AuthGuard from "@/components/auth/AuthGuard";
import RouteSecurity from "@/components/auth/RouteSecurity";

export default function RootLayout({children}: { children: React.ReactNode; }) {
    return (
        <html lang="en" suppressHydrationWarning>
        <body>
        <Provider defaultTheme={'dark'}>
            <AuthInitializer/>
            {children}
        </Provider>
        </body>
        </html>
    );
}
