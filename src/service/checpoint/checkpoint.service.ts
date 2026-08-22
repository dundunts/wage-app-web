import {Checkpoint, CreateRegularCheckpointPayload, UpdateShiftCheckpointPayload} from "@/types/checkpoint.types";
import {checkpointApiClient, CheckpointApiClient} from "@/api/checkpoint/checkpoint.api.client";
import {formatLocalDateTime} from "@/utils/date.utils";

export class CheckpointService {
    constructor(private readonly apiClient: CheckpointApiClient) {
    }

    async create(payload: CreateRegularCheckpointPayload): Promise<Checkpoint> {
        const response = await this.apiClient.create({
            ...payload,
            dateTime: formatLocalDateTime(payload.dateTime)
        })
        return response.data
    }

    async update(payload: UpdateShiftCheckpointPayload): Promise<Checkpoint> {
        const response = await this.apiClient.update({
            ...payload,
            dateTime: formatLocalDateTime(payload.dateTime)
        })
        return response.data
    }

    async delete(id: string): Promise<void> {
        await this.apiClient.delete(id)
    }
}

export const checkpointService = new CheckpointService(checkpointApiClient)
