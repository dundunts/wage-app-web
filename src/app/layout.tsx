import "./globals.css";
import {AuthSessionProvider} from "./providers/session-provider";
import {Provider} from "@/components/ui/provider";
import {Header} from "@/components/header/Header";

export default function RootLayout({children}: { children: React.ReactNode; }) {
    return (
        <html lang="en" suppressHydrationWarning>
            <body>
                <Provider>
                    <AuthSessionProvider>
                        <Header />
                        {children}
                    </AuthSessionProvider>
                </Provider>
            </body>
        </html>
    );
}
