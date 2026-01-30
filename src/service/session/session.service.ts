import {Session} from "@/types/session.types";

export async function getSessions(companyId: string): Promise<Session[]> {
    const res = await fetch(
        `/api/external/session/available/all?companyId=${companyId}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Failed to load sessions");
    }

    return res.json();
}

export async function getAvailableSession(sessionId: string): Promise<Session> {
    const res = await fetch(
        `/api/external/session/available/${sessionId}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Failed to load session");
    }

    return res.json();
}