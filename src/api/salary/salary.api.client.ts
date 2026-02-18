import {AxiosInstance, AxiosResponse} from "axios";
import {axiosBackendClient} from "@/api/config/api";
import {Payroll, PeriodType} from "@/types/salary.types";

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

export class SalaryApiClient {
    constructor(private readonly client: AxiosInstance) {
    }

    async fetchOwn(params: GetOwnSalaryParams): Promise<AxiosResponse<Payroll>> {
        return this.client.get(`/api/v1/salary/own/get`, { params })
    }

    async fetchStaff(params: GetStaffSalaryParams): Promise<AxiosResponse<Payroll>> {
        return this.client.get("/api/v1/salary/staff/get", { params })
    }
}

export const salaryApiClient = new SalaryApiClient(axiosBackendClient)