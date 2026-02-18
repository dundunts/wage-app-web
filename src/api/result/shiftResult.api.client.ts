import {AxiosInstance, AxiosResponse} from "axios";
import {axiosBackendClient} from "@/api/config/api";
import {Company, CompanyPayload, UserCompaniesResponse} from "@/types/company.types";
import {Page} from "@/types/common.types";
import {
    SaveShiftResultPayload,
    SaveShiftResultResponse,
    ShiftResultDetailed,
    ShiftResultExtendedResponse
} from "@/types/shiftResult.types";

interface GetShiftResultsByPeriodParams {
    companyId: string;
    periodType: string;
    now: string;
    start?: string;
    end?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export class ShiftResultApiClient {
    constructor(private readonly client: AxiosInstance) {
    }

    async fetchDetailedById(resultId: string): Promise<AxiosResponse<ShiftResultExtendedResponse>> {
        return this.client.get(`/api/v1/shift-result/${resultId}/get/detailed`)
    }

    async fetchPageByPeriod(params: GetShiftResultsByPeriodParams): Promise<AxiosResponse<Page<ShiftResultDetailed>>> {
        return this.client.get("/api/v1/shift-result/get/detailed/by-period/page", {
            params
        })
    }

    async save(payload: SaveShiftResultPayload): Promise<AxiosResponse<SaveShiftResultResponse>> {
        return this.client.post("/api/v1/shift-result/save", payload)
    }

    async delete(id: string): Promise<AxiosResponse<void>> {
        return this.client.delete(`/api/v1/shift-result/${id}/delete`)
    }
}

export const shiftResultApiClient = new ShiftResultApiClient(axiosBackendClient)