import {AxiosInstance, AxiosResponse} from "axios";
import {axiosBackendClient} from "@/api/config/api";
import {Checkpoint} from "@/types/checkpoint.types";
import {CreateRegularCheckpointApiPayload, UpdateShiftCheckpointApiPayload} from "@/api/checkpoint/checkpoint.api.dto";

export class CheckpointApiClient {
    constructor(private readonly client: AxiosInstance) {
    }

    async create(payload: CreateRegularCheckpointApiPayload): Promise<AxiosResponse<Checkpoint>> {
        return this.client.post("/api/v1/checkpoint/create", payload)
    }

    async update(payload: UpdateShiftCheckpointApiPayload): Promise<AxiosResponse<Checkpoint>> {
        return this.client.post(`/api/v1/checkpoint/update`, payload)
    }

    async delete(id: string): Promise<AxiosResponse<void>> {
        return this.client.delete(`/api/v1/checkpoint/${id}/delete`)
    }
}

export const checkpointApiClient = new CheckpointApiClient(axiosBackendClient)