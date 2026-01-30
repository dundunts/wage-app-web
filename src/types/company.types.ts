export interface Company {
    id: string;
    title: string;
    employeeWageCoefficientFromRevenue: number;
    defaultShiftStartTime: string; // HH:mm
}

export interface CompanyPayload {
    title: string;
    employeeWageCoefficientFromRevenue: number;
    defaultShiftStartTime: string; // HH:mm
}

export interface UserCompaniesResponse {
    companies: Company[]
}