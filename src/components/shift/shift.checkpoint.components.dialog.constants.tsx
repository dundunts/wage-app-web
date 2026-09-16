import {CheckpointCalcDestination, CheckpointForm, CheckpointType} from "@/types/checkpoint.types";

export const CASH_TIPS_LABEL = "Чай (нал)";
export const QR_TIPS_LABEL = "Чай (по QR)";

export const checkpointDialogForms: Record<CheckpointType, CheckpointForm> = {
    REGULAR: {
        label: "Обычный",
        fields: [
            {
                label: "Выручка",
                destination: CheckpointCalcDestination.REVENUE
            },
            {
                label: "Чай",
                destination: CheckpointCalcDestination.TIPS
            },
        ]
    },
    FINAL: {
        label: "Финальный",
        fields: [
            {
                label: "Неплатильщики",
                destination: CheckpointCalcDestination.REVENUE
            },
            {
                label: "Кредит. карты (з)",
                destination: CheckpointCalcDestination.REVENUE
            },
            {
                label: "Кредит. карты (обс)",
                destination: CheckpointCalcDestination.TIPS
            },
            {
                label: "Рубли (з)",
                destination: CheckpointCalcDestination.REVENUE
            },
            {
                label: CASH_TIPS_LABEL,
                destination: CheckpointCalcDestination.TIPS
            },
            {
                label: QR_TIPS_LABEL,
                destination: CheckpointCalcDestination.TIPS
            },
        ]
    }
}

export const createCheckpointDialogForms: Record<CheckpointType, CheckpointForm> = {
    ...checkpointDialogForms,
    REGULAR: {
        ...checkpointDialogForms.REGULAR,
        fields: [
            checkpointDialogForms.REGULAR.fields[0],
            {label: CASH_TIPS_LABEL, destination: CheckpointCalcDestination.TIPS},
            {label: QR_TIPS_LABEL, destination: CheckpointCalcDestination.TIPS},
        ],
    },
};
