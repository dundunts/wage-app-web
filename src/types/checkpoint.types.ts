import {EmployeeBase} from "@/types/employee.types";

export interface Checkpoint {
    id: string;
    tips: number;
    revenue: number;
    employees: EmployeeBase[];
    dateTime: Date;
    type: CheckpointType;
    metricRecords: MetricRecord[];
}

export enum CheckpointType {
    REGULAR = "REGULAR",
    FINAL = "FINAL"
}

export enum CheckpointCalcDestination {
    REVENUE = "REVENUE",
    TIPS = "TIPS",
}

export interface CheckpointForm {
    label: string;
    fields: CheckpointFormField[];
}

export interface CheckpointFormField {
    label: string;
    destination: CheckpointCalcDestination
}

export interface MetricRecord {
    id: string;
    label: string;
    destination: CheckpointCalcDestination
    value: number;
}

export interface CheckpointMetricRecordPayload {
    label: string;
    destination: CheckpointCalcDestination;
    value: number;
}

// base payload
export interface CheckpointPayload {
    revenue: number;
    tips: number;
    employeeIds: string[];
    dateTime: Date;
    type: CheckpointType;
    fieldRecords: CheckpointMetricRecordPayload[];
}

// create
export interface CreateFirstShiftCheckpointPayload
    extends CheckpointPayload {
    companyId: string;
}

export interface CreateRegularCheckpointPayload
    extends CheckpointPayload {
    sessionId: string;
}

// update
export interface UpdateShiftCheckpointPayload
    extends CheckpointPayload {
    id: string;
}