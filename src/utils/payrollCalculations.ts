import {
    PayrollElement,
    PayrollEmployeeInfo,
    PayrollPayment,
} from "@/types/salary.types";

export interface DayStat {
    date: string;
    total: number;
    percent: number;
    tips: number;
}

export interface DayEmployeeStat {
    date: string;
    // Здесь будут динамические ключи вида [employeeId: string]: number
    [key: string]: string | number;
}

export function calculateEmployeesByDays(elements: PayrollElement[]) {
    // Словарь для хранения имен: { "id-1": "Иван И.", "id-2": "Анна С." }
    const employeesMap: Record<string, string> = {};

    const data: DayEmployeeStat[] = elements.map((el) => {
        const dayStat: DayEmployeeStat = { date: el.date };

        el.payments.forEach((p) => {
            const emp = p.employee;
            const empId = emp.id;

            // Запоминаем имя для легенды (используем simpleName или собираем из Имени/Фамилии)
            if (!employeesMap[empId]) {
                employeesMap[empId] = emp.simpleName || `${emp.firstName} ${emp.lastName[0]}.`;
            }

            const totalEmpPayment = p.percentFromRevenue + p.tips;

            // Если у сотрудника несколько выплат в один день, суммируем их
            if (typeof dayStat[empId] === 'number') {
                (dayStat[empId] as number) += totalEmpPayment;
            } else {
                dayStat[empId] = totalEmpPayment;
            }
        });

        return dayStat;
    });

    return { data, employeesMap };
}

// Вспомогательная функция для подготовки данных
export function prepareChartData(elements: PayrollElement[]) {
    const employeeNames: Record<string, string> = {};

    const chartData = elements.map((el) => {
        // Инициализируем объект дня датой
        const dayEntry: DayEmployeeStat = { date: el.date };

        el.payments.forEach((p) => {
            const id = p.employee.id;
            const fullName = p.employee.simpleName || `${p.employee.firstName} ${p.employee.lastName[0]}.`;

            // Сохраняем маппинг ID -> Имя для легенды
            employeeNames[id] = fullName;

            // Суммируем выплату (процент + чаевые)
            const amount = p.percentFromRevenue + p.tips;
            const previous = dayEntry[id];
            dayEntry[id] = (typeof previous === "number" ? previous : 0) + amount;
        });

        return dayEntry;
    });

    return {
        chartData,
        employeeIds: Object.keys(employeeNames),
        employeeNames
    };
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
