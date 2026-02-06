import {
    Payroll,
    PayrollElement,
    PayrollPayment,
    PayrollEmployeeInfo,
} from "@/types/salary.types";

export interface DayStat {
    date: string;
    total: number;
    percent: number;
    tips: number;
}

function sumPayments(payments: PayrollPayment[]) {
    return payments.reduce(
        (acc, p) => {
            acc.total += p.percentFromRevenue + p.tips;
            acc.percent += p.percentFromRevenue;
            acc.tips += p.tips;
            return acc;
        },
        { total: 0, percent: 0, tips: 0 }
    );
}

export function calculateByDays(elements: PayrollElement[]): DayStat[] {
    return elements.map((el) => {
        const sums = sumPayments(el.payments);
        return {
            date: el.date,
            total: sums.total,
            percent: sums.percent,
            tips: sums.tips,
        };
    });
}

export function calculateSummary(days: DayStat[]) {
    if (days.length === 0) {
        return null;
    }

    const totals = days.reduce(
        (acc, d) => {
            acc.total += d.total;
            acc.percent += d.percent;
            acc.tips += d.tips;
            acc.max = Math.max(acc.max, d.total);
            acc.min = Math.min(acc.min, d.total);
            return acc;
        },
        {
            total: 0,
            percent: 0,
            tips: 0,
            max: Number.NEGATIVE_INFINITY,
            min: Number.POSITIVE_INFINITY,
        }
    );

    return {
        total: totals.total,
        days: days.length,
        avgTotal: totals.total / days.length,
        avgPercent: totals.percent / days.length,
        avgTips: totals.tips / days.length,
        max: totals.max,
        min: totals.min,
    };
}

export function groupByEmployee(
    elements: PayrollElement[]
): Map<string, { employee: PayrollEmployeeInfo; total: number; days: DayStat[] }> {
    const map = new Map<
        string,
        { employee: PayrollEmployeeInfo; total: number; days: DayStat[] }
    >();

    elements.forEach((el) => {
        el.payments.forEach((p) => {
            const dayTotal = p.percentFromRevenue + p.tips;

            const existing = map.get(p.employee.id);
            if (!existing) {
                map.set(p.employee.id, {
                    employee: p.employee,
                    total: dayTotal,
                    days: [
                        {
                            date: el.date,
                            total: dayTotal,
                            percent: p.percentFromRevenue,
                            tips: p.tips,
                        },
                    ],
                });
            } else {
                existing.total += dayTotal;
                existing.days.push({
                    date: el.date,
                    total: dayTotal,
                    percent: p.percentFromRevenue,
                    tips: p.tips,
                });
            }
        });
    });

    return map;
}
