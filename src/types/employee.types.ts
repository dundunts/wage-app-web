// export interface Employee {
//     id: string;
//     companyIds: string[];
//     firstName: string;
//     lastName: string;
//     patronymic: string;
//     simpleName: string | null;
// }

export interface EmployeeBase {
    id: string;
    userId: string | null;
    firstName: string;
    lastName: string;
    patronymic: string;
    simpleName: string | null;
}

export enum EmployeePosition {
    MANAGER = "MANAGER",
    WAITER_ACTIVE = "WAITER_ACTIVE",
    WAITER_INACTIVE = "WAITER_INACTIVE",
}

export interface Employee {
    id: string;
    companyIds: string[];
    userId: string | null;
    firstName: string;
    lastName: string;
    patronymic: string;
    simpleName: string | null;
    position: EmployeePosition;
}

export interface CompanyEmployeeInfo {
    id: string;
    userId: string | null;
    firstName: string;
    lastName: string;
    patronymic: string;
    simpleName: string | null;
    position: EmployeePosition;
}

export interface CompanyEmployeesResponse {
    companyId: string;
    data: CompanyEmployeeInfo[];
}

// Create
export interface CreateEmployeePayload {
    companyIds?: string[];
    firstName: string;
    lastName: string;
    patronymic: string;
    simpleName?: string | null;
    position: EmployeePosition;
}

// Update
export interface UpdateEmployeePayload {
    companyIds?: string[];
    userId?: string | null;
    firstName: string;
    lastName: string;
    patronymic: string;
    simpleName?: string | null;
    position: EmployeePosition;
}
