import {Employee} from "@/types/employee.types";

export interface ShiftResultsDraft {
    payments: EmployeePaymentDraft[]
}

export interface EmployeePaymentDraft {
    employee: Employee;
    percentFromRevenue: number;
    tips: number;
    startWorkAt: Date;
    endWorkAt: Date;
}