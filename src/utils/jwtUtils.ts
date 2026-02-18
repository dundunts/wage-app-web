import {JwtPayload} from "@/types/JwtPayload";
import {jwtDecode} from "jwt-decode";

export function parseJwt(token: string): JwtPayload | null {
    try {
        return jwtDecode<JwtPayload>(token);
    } catch (error) {
        console.error("Invalid JWT token:", error);
        return null;
    }
}
