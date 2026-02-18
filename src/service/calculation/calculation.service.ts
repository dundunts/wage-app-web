import {ConfirmDraftResponse, ShiftResultDraft} from "@/types/draft.types";
import {calculationApiClient, CalculationApiClient} from "@/api/calculation/calculation.api.client";

export class CalculationService {
    constructor(private readonly apiClient: CalculationApiClient) {
    }

    async getDraftForSession(sessionId: string): Promise<ShiftResultDraft> {
        try {
            const response = await this.apiClient.fetchDraftForSession(sessionId)
            return response.data
        } catch (e) {
            console.error("Calculation service", e)
            return Promise.reject(e)
        }
    }

    async confirmDraft(draftId: string): Promise<ConfirmDraftResponse> {
        try {
            const response = await this.apiClient.confirmDraft(draftId)
            return response.data
        } catch (e) {
            console.error("Calculation service", e)
            return Promise.reject(e)
        }
    }

    async deleteDraft(draftId: string): Promise<void> {
        try {
            await this.apiClient.deleteDraft(draftId)
        } catch (e) {
            console.error("Calculation service", e)
            return Promise.reject(e)
        }
    }
}

export const calculationService = new CalculationService(calculationApiClient);