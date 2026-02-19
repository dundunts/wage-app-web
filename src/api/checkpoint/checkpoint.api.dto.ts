import {CheckpointMetricRecordPayload, CheckpointType} from "@/types/checkpoint.types";

export interface CheckpointApiPayload {
    revenue: number;
    tips: number;
    employeeIds: string[];
    dateTime: string;
    type: CheckpointType;
    fieldRecords: CheckpointMetricRecordPayload[];
}

export interface CreateFirstShiftCheckpointApiPayload
    extends CheckpointApiPayload {
    companyId: string;
}

export interface CreateRegularCheckpointApiPayload
    extends CheckpointApiPayload {
    sessionId: string;
}

export interface UpdateShiftCheckpointApiPayload
    extends CheckpointApiPayload {
    id: string;
}