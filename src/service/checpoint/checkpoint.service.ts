import {Checkpoint, CreateRegularCheckpointPayload, UpdateShiftCheckpointPayload} from "@/types/checkpoint.types";

export async function createCheckpoint(payload: CreateRegularCheckpointPayload): Promise<Checkpoint> {
    const res = await fetch(
        `/api/external/checkpoint/create`,
        {
            method: "POST",
            body: JSON.stringify(payload),
            cache: "no-store"
        }
    );

    if (!res.ok) {
        throw new Error("Failed to load company");
    }

    return res.json();
}

export async function updateCheckpoint(payload: UpdateShiftCheckpointPayload): Promise<Checkpoint> {
    const res = await fetch(
        `/api/external/checkpoint/update`,
        {
            method: "POST",
            body: JSON.stringify(payload),
            cache: "no-store"
        }
    );

    if (!res.ok) {
        throw new Error("Failed to load company");
    }

    return res.json();
}

export async function deleteCheckpoint(checkpointId: string): Promise<void> {
    const res = await fetch(
        `/api/external/checkpoint/${checkpointId}/delete`,
        {
            method: "DELETE",
            cache: "no-store"
        }
    );

    if (!res.ok) {
        throw new Error("Failed to load company");
    }
}