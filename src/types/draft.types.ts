// entities
export interface ShiftResultDraft {
    id: string;
    payments: PaymentDraft[];
    date: string; // ISO LocalDate (YYYY-MM-DD)
    sessionId: string;
}

export interface PaymentDraft {
    id: string;
    employee: PaymentDraftEmployeeInfo;
    percentFromRevenue: number;
    tips: number;
    workSeconds: number;
}

export interface PaymentDraftEmployeeInfo {
    id: string;
    firstName: string;
    lastName: string;
    patronymic: string;
    simpleName?: string | null;
}

// responses
export interface ConfirmDraftResponse {
    resultId: string;
}
