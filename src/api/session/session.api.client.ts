import {AxiosInstance, AxiosResponse} from "axios";
import {axiosBackendClient} from "@/api/config/api";
import {Session, UpdateShiftSessionStartWorkTimePayload} from "@/types/session.types";
import {OpenNewShiftSessionApiPayload} from "@/api/session/session.api.dto";

export class SessionApiClient {
    constructor(private readonly client: AxiosInstance) {
    }

    async fetchAllAvailableByCompany(companyId: string): Promise<AxiosResponse<Session[]>> {
        return this.client.get(`/api/v1/session/get/available/all`, {
            params: { companyId }
        })
    }

    async fetchAvailableById(sessionId: string): Promise<AxiosResponse<Session>> {
        return this.client.get(`/api/v1/session/get/available/${sessionId}`)
    }

    async open(payload: OpenNewShiftSessionApiPayload): Promise<AxiosResponse<Session>> {
        return this.client.post("/api/v1/session/open", payload)
    }

    async close(id: string): Promise<AxiosResponse<void>> {
        return this.client.put(`/api/v1/session/${id}/close`)
    }

    async updateStartWorkTime(payload: UpdateShiftSessionStartWorkTimePayload): Promise<AxiosResponse<void>> {
        return this.client.put(`/api/v1/session/update/time`, payload)
    }
}

export const sessionApiClient = new SessionApiClient(axiosBackendClient)