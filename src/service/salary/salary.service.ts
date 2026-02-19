import {Payroll, PeriodType} from "@/types/salary.types";
import {salaryApiClient, SalaryApiClient} from "@/api/salary/salary.api.client";
import {axiosBackendClient} from "@/api/config/api";

interface GetOwnSalaryParams {
    companyId: string;
    periodType: PeriodType;
    start?: string;
    end?: string;
    now?: string;
}

interface GetStaffSalaryParams {
    companyId: string;
    periodType: PeriodType;
    start?: string;
    end?: string;
    now?: string;
}

export class SalaryService {
    constructor(private readonly apiClient: SalaryApiClient) {
    }

    async getOwn(params: GetOwnSalaryParams): Promise<Payroll> {
        try {
            const mappedParams = {...params, now: new Date().toISOString().slice(0, 10)}
            const response = await this.apiClient.fetchOwn(mappedParams)
            return response.data
        } catch (e) {
            console.error("Salary service", e)
            return Promise.reject(e)
        }
    }

    async getStaff(params: GetStaffSalaryParams): Promise<Payroll> {
        try {
            const mappedParams = {...params, now: new Date().toISOString().slice(0, 10)}
            const response = await this.apiClient.fetchStaff(mappedParams)
            return response.data
        } catch (e) {
            console.error("Salary service", e)
            return Promise.reject(e)
        }
    }

    async downloadReportTable(params: GetStaffSalaryParams) {
        try {
            const mappedParams = {...params, now: new Date().toISOString().slice(0, 10)}
            const response = await this.apiClient.downloadStaffExcelTable(mappedParams)
            return response.data;
        } catch (e) {
            console.error("ShiftResult service", e)
            return Promise.reject(e)
        }
    }
}

export const salaryService = new SalaryService(salaryApiClient);