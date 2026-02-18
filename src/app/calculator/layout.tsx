import RouteSecurity from "@/components/auth/RouteSecurity";

export default function SecuredLayout({children}: { children: React.ReactNode; }) {
    return (
        <RouteSecurity onlyAuthenticated redirectOnReject={"/auth"}>
            {children}
        </RouteSecurity>
    );
}