export interface OpenNewShiftSessionApiPayload {
    companyId: string;     // UUID
    startWorkAt: string;   // ISO date-time
}

export interface SessionQrTipsResponse {
    tips: number;
}
