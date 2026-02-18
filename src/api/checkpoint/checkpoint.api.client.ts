import {AxiosInstance, AxiosResponse} from "axios";
import {axiosBackendClient} from "@/api/config/api";
import {Checkpoint, CreateRegularCheckpointPayload, UpdateShiftCheckpointPayload} from "@/types/checkpoint.types";

export class CheckpointApiClient {
    constructor(private readonly client: AxiosInstance) {
    }

    async create(payload: CreateRegularCheckpointPayload): Promise<AxiosResponse<Checkpoint>> {
        return this.client.post("/api/v1/checkpoint/create", payload)
    }

    async update(payload: UpdateShiftCheckpointPayload): Promise<AxiosResponse<Checkpoint>> {
        return this.client.post(`/api/v1/checkpoint/update`, payload)
    }

    async delete(id: string): Promise<AxiosResponse<void>> {
        return this.client.delete(`/api/v1/checkpoint/${id}/delete`)
    }
}

export const checkpointApiClient = new CheckpointApiClient(axiosBackendClient)