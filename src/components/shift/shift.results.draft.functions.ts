import {ShiftCheckpoint} from "@/types/shift.types";
import {Company} from "@/types/company.types";
import {EmployeePaymentDraft, ShiftResultsDraft} from "@/types/shift.results.draft.types";

export const calculateResults = (
    checkpoints: ShiftCheckpoint[],
    company: Company,
    date: Date,
    isDirty: boolean
): ShiftResultsDraft | null => {
    if (checkpoints.length === 0 || isDirty) {
        return null;
    }

    const map = new Map<string, EmployeePaymentDraft>();
    let prevRevenue = 0;
    let prevTips = 0;

    for (let i = 0; i < checkpoints.length; i++) {
        const current = checkpoints[i];
        const percentFromRevenue = Math.floor(
            company.employeeWageCoefficientFromRevenue *
            (current.revenue - prevRevenue) /
            current.employees.length
        );
        const tips = Math.floor(current.tips - prevTips);

        for (const emp of current.employees) {
            if (i === 0) {
                map.set(emp.id, {
                    employee: emp,
                    percentFromRevenue,
                    tips,
                    startWorkAt: date,
                    endWorkAt: current.dateTime
                });
            } else {
                const data = map.get(emp.id) || {
                    employee: emp,
                    percentFromRevenue: 0,
                    tips: 0,
                    startWorkAt: checkpoints[i - 1].dateTime,
                    endWorkAt: current.dateTime
                };

                map.set(emp.id, {
                    ...data,
                    percentFromRevenue: percentFromRevenue + data.percentFromRevenue,
                    tips: tips + data.tips,
                    endWorkAt: current.dateTime
                });
            }
        }

        prevRevenue = current.revenue;
        prevTips = current.tips;
    }

    return {
        payments: Array.from(map.values())
            .sort((a, b) =>
                b.tips + b.percentFromRevenue - a.tips - a.percentFromRevenue)
    };
};