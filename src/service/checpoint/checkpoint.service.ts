import {Checkpoint, CreateRegularCheckpointPayload, UpdateShiftCheckpointPayload} from "@/types/checkpoint.types";
import {checkpointApiClient, CheckpointApiClient} from "@/api/checkpoint/checkpoint.api.client";
import {formatLocalDateTime} from "@/utils/date.utils";

export class CheckpointService {
    constructor(private readonly apiClient: CheckpointApiClient) {
    }

    async create(payload: CreateRegularCheckpointPayload): Promise<Checkpoint> {
        try {
            const response = await this.apiClient.create({
                ...payload,
                dateTime: formatLocalDateTime(payload.dateTime)
            })
            return response.data
        } catch (e) {
            console.error("Checkpoint service", e)
            return Promise.reject(e)
        }
    }

    async update(payload: UpdateShiftCheckpointPayload): Promise<Checkpoint> {
        try {
            console.log("Checkpoint service. Update checkpoint", payload)
            const response = await this.apiClient.update({
                ...payload,
                dateTime: formatLocalDateTime(payload.dateTime)
            })
            return response.data
        } catch (e) {
            console.error("Checkpoint service", e)
            return Promise.reject(e)
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.apiClient.delete(id)
        } catch (e) {
            console.error("Checkpoint service", e)
            return Promise.reject(e)
        }
    }
}

export const checkpointService = new CheckpointService(checkpointApiClient)