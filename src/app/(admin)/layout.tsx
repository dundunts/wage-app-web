import {Header} from "@/components/navigation/Header";
import RouteSecurity from "@/components/auth/RouteSecurity";
import {adminPermissions} from "@/constants/roles";

export default function AdminLayout({children}: { children: React.ReactNode; }) {
    return (
        <RouteSecurity requiredRoles={adminPermissions} redirectOnReject={"/"}>
            <>
                <Header/>
                {children}
            </>
        </RouteSecurity>
    );
}
