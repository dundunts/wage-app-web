"use client";

import {Payroll} from "@/types/salary.types";
import {
    calculateByDays,
    calculateEmployeesByDays,
    calculateSummary,
    groupByEmployee,
    prepareChartData,
} from "@/utils/payrollCalculations";
import {Accordion, Box, SimpleGrid, Stat, Text,} from "@chakra-ui/react";
import {useMemo} from "react";
import {Bar, BarChart, CartesianGrid, Legend, ResponsiveContainer, Tooltip, XAxis, YAxis} from "recharts";

interface Props {
    payroll: Payroll;
}

export function StaffStatistic({ payroll }: Props) {
    const days = useMemo(
        () => calculateByDays(payroll.elements),
        [payroll.elements]
    );

    const { data: daysByEmployee, employeesMap } = useMemo(
        () => calculateEmployeesByDays(payroll.elements),
        [payroll.elements]
    );

    const summary = useMemo(
        () => calculateSummary(days),
        [days]
    );

    const employees = useMemo(
        () => groupByEmployee(payroll.elements),
        [payroll.elements]
    );

    const { chartData, employeeIds, employeeNames } = useMemo(
        () => prepareChartData(payroll.elements),
        [payroll.elements]
    );

    if (!summary) {
        return null;
    }

    return (
        <Box>
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <Stat.Root>
                    <Stat.Label>Общая сумма выплат</Stat.Label>
                    <Stat.ValueText>{summary.total.toFixed(2)}</Stat.ValueText>
                </Stat.Root>

                <Stat.Root>
                    <Stat.Label>Средний общий доход за день</Stat.Label>
                    <Stat.ValueText>{summary.avgTotal.toFixed(2)}</Stat.ValueText>
                </Stat.Root>

                <Stat.Root>
                    <Stat.Label>Макс / Мин общий за день</Stat.Label>
                    <Stat.ValueText>
                        {summary.max.toFixed(2)} / {summary.min.toFixed(2)}
                    </Stat.ValueText>
                </Stat.Root>
            </SimpleGrid>

            <PayrollEmployeeChart
                data={chartData}
                employeeIds={employeeIds}
                namesMap={employeeNames}
            />

            <Box mt={8}>
                <Accordion.Root multiple defaultValue={["b"]}>
                    {[...employees.values()].sort((a, b) => b.total - a.total).map((employeeStat) => (
                        <Accordion.Item key={employeeStat.employee.id} value={employeeStat.employee.id}>
                            <Accordion.ItemTrigger>
                                <Box flex="1" textAlign="left">
                                    {employeeStat.employee.simpleName ||
                                        `${employeeStat.employee.lastName} ${employeeStat.employee.firstName}`}
                                </Box>
                                <Text fontWeight="bold">
                                    {employeeStat.total.toFixed(2)}
                                </Text>
                                <Accordion.ItemIndicator />
                            </Accordion.ItemTrigger>
                            <Accordion.ItemContent>
                                <Accordion.ItemBody>
                                    {employeeStat.days.map((day) => (
                                        <Text key={day.date}>
                                            {day.date}: {day.total.toFixed(2)}
                                        </Text>
                                    ))}
                                </Accordion.ItemBody>
                            </Accordion.ItemContent>
                        </Accordion.Item>
                    ))}
                </Accordion.Root>
            </Box>
        </Box>
    );
}

interface PayrollEmployeeChartProps {
    data: unknown[];
    employeeIds: string[];
    namesMap: Record<string, string>;
}

// Набор приятных цветов для графиков
const COLORS = ['#8884d8', '#82ca9d', '#ffc658', '#ff8042', '#0088FE', '#00C49F'];

export const PayrollEmployeeChart = ({ data, employeeIds, namesMap }: PayrollEmployeeChartProps) => {
    return (
        <div style={{ width: '100%', height: 400 }}>
            <ResponsiveContainer>
                <BarChart data={data} margin={{ top: 20, right: 30, left: 20, bottom: 5 }}>
                    <CartesianGrid strokeDasharray="3 3" vertical={false} />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip
                        // Форматируем ID в понятное имя в тултипе
                        // @ts-expect-error Recharts formatter accepts the runtime numeric value.
                        formatter={(value: number, name: string) => [value.toFixed(2), namesMap[name]]}
                    />
                    <Legend
                        // Форматируем ID в понятное имя в легенде
                        formatter={(value) => namesMap[value]}
                    />

                    {employeeIds.map((id, index) => (
                        <Bar
                            key={id}
                            dataKey={id}
                            stackId="a" // Это делает график "стопкой" (один над другим)
                            fill={COLORS[index % COLORS.length]}
                            radius={index === employeeIds.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                        />
                    ))}
                </BarChart>
            </ResponsiveContainer>
        </div>
    );
};
