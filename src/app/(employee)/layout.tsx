import {Header} from "@/components/navigation/Header";
import RouteSecurity from "@/components/auth/RouteSecurity";

export default function EmployeeLayout({children}: { children: React.ReactNode; }) {
    return (
        <RouteSecurity onlyAuthenticated redirectOnReject={"/auth"}>
            <>
                <Header/>
                {children}
            </>
        </RouteSecurity>
    );
}
