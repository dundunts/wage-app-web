import {CheckpointCalcDestination, CheckpointForm, CheckpointType} from "@/types/checkpoint.types";

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
                label: "Чай (нал)",
                destination: CheckpointCalcDestination.TIPS
            },
            {
                label: "Чай (по QR)",
                destination: CheckpointCalcDestination.TIPS
            },
        ]
    }
}