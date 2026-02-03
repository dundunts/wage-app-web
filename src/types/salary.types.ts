/* ================= enums ================= */

export enum PeriodType {
    CUSTOM = "CUSTOM",
    CURRENT = "CURRENT",
    PREVIOUS = "PREVIOUS",
}

export enum PayrollType {
    BY_DAY = "BY_DAY",
    BY_MONTH = "BY_MONTH",
    BY_YEAR = "BY_YEAR",
}

/* ================= data ================= */

export interface Payroll {
    type: PayrollType;
    elements: PayrollElement[];
    summaries: PayrollEmployeeSummary[];
}

export interface PayrollElement {
    date: string; // ISO LocalDate
    payments: PayrollPayment[];
}

export interface PayrollPayment {
    employee: PayrollEmployeeInfo;
    percentFromRevenue: number;
    tips: number;
}

export interface PayrollEmployeeSummary {
    employee: PayrollEmployeeInfo;
    totalPercentFromRevenue: number;
    totalTips: number;
}

export interface PayrollEmployeeInfo {
    id: string;
    firstName: string;
    lastName: string;
    patronymic: string;
    simpleName?: string | null;
}
