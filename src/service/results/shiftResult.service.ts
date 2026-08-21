import {
    SaveShiftResultPayload,
    SaveShiftResultResponse,
    ShiftResultDetailed,
    ShiftResultExtendedResponse,
} from "@/types/shiftResult.types";
import {Page} from "@/types/common.types";
import {shiftResultApiClient, ShiftResultApiClient} from "@/api/result/shiftResult.api.client";

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

export class ShiftResultService {
    constructor(private readonly apiClient: ShiftResultApiClient) {
    }

    async getDetailed(id: string): Promise<ShiftResultExtendedResponse> {
        const response = await this.apiClient.fetchDetailedById(id)
        return response.data
    }

    async getPageByPeriod(params: GetShiftResultsByPeriodParams): Promise<Page<ShiftResultDetailed>> {
        const mappedParams = {...params, now: params.now.slice(0, 10)}
        const response = await this.apiClient.fetchPageByPeriod(mappedParams)
        return response.data
    }

    async save(payload: SaveShiftResultPayload): Promise<SaveShiftResultResponse> {
        const response = await this.apiClient.save(payload)
        return response.data
    }

    async delete(resultId: string): Promise<void> {
        await this.apiClient.delete(resultId)
    }
}

export const shiftResultService = new ShiftResultService(shiftResultApiClient);
