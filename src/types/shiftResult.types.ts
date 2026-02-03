import { Session } from "@/types/session.types";

/* ================= enums ================= */

export enum CalculationSource {
    CHECKPOINTS = "CHECKPOINTS",
    MANUAL_OVERRIDE = "MANUAL_OVERRIDE",
}

/* ================= data ================= */

export interface ShiftResultDetailed {
    id: string;
    payments: ShiftResultPayment[];
    date: Date;
    sessionId: string | null;
    calculationSource: CalculationSource;
}

export interface ShiftResultPayment {
    id: string;
    employee: ShiftResultEmployeeInfo;
    percentFromRevenue: number;
    tips: number;
    workSeconds: number;
}

export interface ShiftResultEmployeeInfo {
    id: string;
    firstName: string;
    lastName: string;
    patronymic: string;
    simpleName?: string | null;
}

/* ================= responses ================= */

export interface ShiftResultExtendedResponse {
    shiftResult: ShiftResultDetailed;
    session: Session | null;
}

export interface SaveShiftResultResponse {
    resultId: string;
}

/* ================= payloads ================= */

export interface SaveShiftResultPayload {
    companyId: string;
    overwrite?: boolean; //при создании false, а при изменении true
    date: Date;
    payments: SaveShiftResultPaymentPayload[];
}

export interface SaveShiftResultPaymentPayload {
    employeeId: string;
    percentFromRevenue: number;
    tips: number;
    workSeconds: number;
}