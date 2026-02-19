// @/service/session/session.service.ts

import {OpenNewShiftSessionPayload, Session, UpdateShiftSessionStartWorkTimePayload} from "@/types/session.types";
import {SessionApiClient, sessionApiClient} from "@/api/session/session.api.client";
import {formatLocalDateTime} from "@/utils/date.utils";

export class SessionService {
    constructor(private readonly apiClient: SessionApiClient) {
    }

    async getAllAvailableByCompany(companyId: string): Promise<Session[]> {
        try {
            const response = await this.apiClient.fetchAllAvailableByCompany(companyId)
            return response.data
        } catch (e) {
            console.error("Session service", e)
            return Promise.reject(e)
        }
    }

    async getAvailableById(sessionId: string): Promise<Session> {
        try {
            const response = await this.apiClient.fetchAvailableById(sessionId)
            return response.data
        } catch (e) {
            console.error("Session service", e)
            return Promise.reject(e)
        }
    }

    async open(payload: OpenNewShiftSessionPayload): Promise<Session> {
        try {
            const response = await this.apiClient.open({
                ...payload,
                startWorkAt: formatLocalDateTime(payload.startWorkAt)
            })
            return response.data
        } catch (e) {
            console.error("Session service", e)
            return Promise.reject(e)
        }
    }

    async close(sessionId: string): Promise<void> {
        try {
            await this.apiClient.close(sessionId)
        } catch (e) {
            console.error("Session service", e)
            return Promise.reject(e)
        }
    }

    async updateStartWorkTime(payload: UpdateShiftSessionStartWorkTimePayload): Promise<void> {
        try {
            await this.apiClient.updateStartWorkTime(payload)
        } catch (e) {
            console.error("Session service", e)
            return Promise.reject(e)
        }
    }
}

export const sessionService = new SessionService(sessionApiClient);