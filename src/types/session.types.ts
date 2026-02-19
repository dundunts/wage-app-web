// @/types/session.types.ts

import {Checkpoint} from "@/types/checkpoint.types";

export type SessionStatus =
    | "OPENED"
    | "OPENED_DRAFT"
    | "CLOSED"
    | "RECALCULATING"
    | "RECALCULATING_DRAFT";

export interface Session {
    id: string;
    companyId: string;
    startWorkTime: string; // time
    date: Date; // date
    status: SessionStatus;
    checkpoints: Checkpoint[];
}

export interface OpenNewShiftSessionPayload {
    companyId: string;     // UUID
    startWorkAt: Date;   // ISO date-time
}

export interface CreateRecalculatingShiftSessionPayload {
    closedSessionId: string; // UUID
}

export interface UpdateShiftSessionStartWorkTimePayload {
    sessionId: string;       // UUID
    startWorkTime: string;   // HH:mm
}
