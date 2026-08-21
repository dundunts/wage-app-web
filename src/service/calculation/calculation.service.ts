import {ConfirmDraftResponse, ShiftResultDraft} from "@/types/draft.types";
import {calculationApiClient, CalculationApiClient} from "@/api/calculation/calculation.api.client";

export class CalculationService {
    constructor(private readonly apiClient: CalculationApiClient) {
    }

    async getDraftForSession(sessionId: string): Promise<ShiftResultDraft> {
        const response = await this.apiClient.fetchDraftForSession(sessionId)
        return response.data
    }

    async confirmDraft(draftId: string): Promise<ConfirmDraftResponse> {
        const response = await this.apiClient.confirmDraft(draftId)
        return response.data
    }

    async deleteDraft(draftId: string): Promise<void> {
        await this.apiClient.deleteDraft(draftId)
    }
}

export const calculationService = new CalculationService(calculationApiClient);
