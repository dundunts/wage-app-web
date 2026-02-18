import {AxiosInstance, AxiosResponse} from "axios";
import {axiosBackendClient} from "@/api/config/api";
import {ConfirmDraftResponse, ShiftResultDraft} from "@/types/draft.types";

export class CalculationApiClient {
    constructor(private readonly client: AxiosInstance) {
    }

    async fetchDraftForSession(sessionId: string): Promise<AxiosResponse<ShiftResultDraft>> {
        return this.client.get(`/api/v1/calculation/draft/for-session/${sessionId}`)
    }

    async confirmDraft(draftId: string): Promise<AxiosResponse<ConfirmDraftResponse>> {
        return this.client.post(`/api/v1/calculation/draft/${draftId}/confirm`)
    }

    async deleteDraft(draftId: string): Promise<AxiosResponse<void>> {
        return this.client.delete(`/api/v1/calculation/draft/${draftId}/delete`)
    }
}

export const calculationApiClient = new CalculationApiClient(axiosBackendClient)