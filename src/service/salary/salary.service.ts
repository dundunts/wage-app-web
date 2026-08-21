import {Payroll, PeriodType} from "@/types/salary.types";
import {salaryApiClient, SalaryApiClient} from "@/api/salary/salary.api.client";

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

function withCurrentDate<T extends GetOwnSalaryParams>(params: T): T & {now: string} {
    return {...params, now: new Date().toISOString().slice(0, 10)};
}

export class SalaryService {
    constructor(private readonly apiClient: SalaryApiClient) {
    }

    async getOwn(params: GetOwnSalaryParams): Promise<Payroll> {
        const response = await this.apiClient.fetchOwn(withCurrentDate(params))
        return response.data
    }

    async getStaff(params: GetStaffSalaryParams): Promise<Payroll> {
        const response = await this.apiClient.fetchStaff(withCurrentDate(params))
        return response.data
    }

    async downloadReportTable(params: GetStaffSalaryParams) {
        const mappedParams = {
            ...params,
            now: (params.now ?? new Date().toISOString()).slice(0, 10),
        }
        const response = await this.apiClient.downloadStaffExcelTable(mappedParams)
        return response.data;
    }
}

export const salaryService = new SalaryService(salaryApiClient);
