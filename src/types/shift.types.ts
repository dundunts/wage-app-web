import {Employee} from "@/types/employee.types";

export interface ShiftCheckpoint {
    id: string;
    tips: number;
    revenue: number;
    employees: Employee[];
    dateTime: Date;
    type: CalcCheckpointFormType;
    fieldRecords: CheckpointFormFieldRecord[];
    creatorUserId: string;
    createdAt: Date;
    updaterUserId: string;
    updateAt: Date;
}

export interface CheckpointFormFieldRecord extends CheckpointFormField{
    id: string;
    value: number;
}

export interface ShiftCheckpointPayload {
    revenue: number;
    tips: number;
    employees: Employee[]
    dateTime: Date;
    type: CalcCheckpointFormType;
    fieldRecords: CheckpointFormFieldRecordPayload[]
}

export interface CheckpointFormFieldRecordPayload extends CheckpointFormField{
    value: number;
}

export enum CalcCheckpointFormType {
    REGULAR = "REGULAR",
    FINAL = "FINAL"
}

export interface CheckpointForm {
    label: string;
    fields: CheckpointFormField[];
}

interface CheckpointFormField {
    label: string;
    destination: CheckpointCalcDestination
}

export enum CheckpointCalcDestination {
    REVENUE = "REVENUE",
    TIPS = "TIPS"
}