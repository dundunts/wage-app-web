// @/service/session/session.service.ts

import {OpenNewShiftSessionPayload, Session, UpdateShiftSessionStartWorkTimePayload} from "@/types/session.types";
import {SessionApiClient, sessionApiClient} from "@/api/session/session.api.client";
import {formatLocalDateTime} from "@/utils/date.utils";

export class SessionService {
    constructor(private readonly apiClient: SessionApiClient) {
    }

    async getAllAvailableByCompany(companyId: string): Promise<Session[]> {
        const response = await this.apiClient.fetchAllAvailableByCompany(companyId)
        return response.data
    }

    async getAvailableById(sessionId: string): Promise<Session> {
        const response = await this.apiClient.fetchAvailableById(sessionId)
        return response.data
    }

    async open(payload: OpenNewShiftSessionPayload): Promise<Session> {
        const response = await this.apiClient.open({
            ...payload,
            startWorkAt: formatLocalDateTime(payload.startWorkAt)
        })
        return response.data
    }

    async close(sessionId: string): Promise<void> {
        await this.apiClient.close(sessionId)
    }

    async updateStartWorkTime(payload: UpdateShiftSessionStartWorkTimePayload): Promise<void> {
        await this.apiClient.updateStartWorkTime(payload)
    }
}

export const sessionService = new SessionService(sessionApiClient);
