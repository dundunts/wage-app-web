"use client";

import {Payroll} from "@/types/salary.types";
import {
    calculateByDays,
    calculateSummary,
    groupByEmployee,
    prepareChartData,
} from "@/utils/payrollCalculations";
import type {DayEmployeeStat} from "@/utils/payrollCalculations";
import {Accordion, Box, Heading, SimpleGrid, Text,} from "@chakra-ui/react";
import {useId, useMemo} from "react";
import {Bar, BarChart, ResponsiveContainer, Tooltip} from "recharts";
import {chartPalette, getChartSeriesStyle} from "@/theme/chart";
import {
    StatisticChartAxes,
    StatisticChartLegend,
    StatisticChartTooltip,
} from "@/components/statistic/PayrollCharts";
import {StatisticSummaryCard} from "@/components/statistic/StatisticSummaryCard";

interface Props {
    payroll: Payroll;
}

export function StaffStatistic({ payroll }: Props) {
    const days = useMemo(
        () => calculateByDays(payroll.elements),
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
            <SimpleGrid as="section" aria-label="Сводка статистики команды" columns={{ base: 1, md: 3 }} gap={4}>
                <StatisticSummaryCard label="Общая сумма выплат">
                    {summary.total.toFixed(2)}
                </StatisticSummaryCard>

                <StatisticSummaryCard label="Средний общий доход за день">
                    {summary.avgTotal.toFixed(2)}
                </StatisticSummaryCard>

                <StatisticSummaryCard label="Макс. / мин. общий за день">
                    {summary.max.toFixed(2)} / {summary.min.toFixed(2)}
                </StatisticSummaryCard>
            </SimpleGrid>

            <PayrollEmployeeChart
                data={chartData}
                employeeIds={employeeIds}
                namesMap={employeeNames}
            />

            <Box mt={8} borderWidth="1px" borderColor="border" borderRadius="panel" bg="bg.panel" overflow="hidden">
                <Accordion.Root multiple defaultValue={["b"]}>
                    {[...employees.values()].sort((a, b) => b.total - a.total).map((employeeStat) => (
                        <Accordion.Item key={employeeStat.employee.id} value={employeeStat.employee.id}>
                            <Accordion.ItemTrigger px={4} _hover={{bg: "accent.subtle"}}>
                                <Box flex="1" textAlign="left">
                                    {employeeStat.employee.simpleName ||
                                        `${employeeStat.employee.lastName} ${employeeStat.employee.firstName}`}
                                </Box>
                                <Text fontWeight="bold" fontVariantNumeric="tabular-nums">
                                    {employeeStat.total.toFixed(2)}
                                </Text>
                                <Accordion.ItemIndicator />
                            </Accordion.ItemTrigger>
                            <Accordion.ItemContent borderTopWidth="1px" borderColor="border.muted">
                                <Accordion.ItemBody>
                                    {employeeStat.days.map((day) => (
                                        <Text key={day.date} color="fg.muted" fontVariantNumeric="tabular-nums">
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
    data: DayEmployeeStat[];
    employeeIds: string[];
    namesMap: Record<string, string>;
}

export const PayrollEmployeeChart = ({ data, employeeIds, namesMap }: PayrollEmployeeChartProps) => {
    const titleId = useId();
    const descriptionId = useId();
    const legendItems = employeeIds.map((id, index) => {
        const seriesStyle = getChartSeriesStyle(index);

        return {
            id,
            label: namesMap[id] ?? id,
            color: seriesStyle.color,
            dashArray: seriesStyle.dashArray,
        };
    });

    return (
        <Box
            as="figure"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            mt={6}
            minW={0}
            w="100%"
            overflow="hidden"
            borderWidth="1px"
            borderColor="border"
            borderRadius="panel"
            bg="bg.panel"
            p={{base: 3, md: 5}}
            fontFamily="body"
            fontVariantNumeric="tabular-nums"
        >
            <Heading id={titleId} size="sm">
                Выплаты сотрудникам по дням
            </Heading>
            <Text id={descriptionId} color="fg.muted" fontSize="xs" mt={1} mb={3}>
                Столбчатая диаграмма выплат сотрудникам по датам. Серии перечислены в легенде.
            </Text>
            <StatisticChartLegend items={legendItems} />

            <Box h={{base: "19rem", md: "24rem"}} minW={0} mt={2}>
                <ResponsiveContainer
                    width="100%"
                    height="100%"
                    minWidth={0}
                    minHeight={304}
                    initialDimension={{width: 640, height: 384}}
                >
                    <BarChart data={data} accessibilityLayer margin={{top: 12, right: 8, left: 4, bottom: 0}}>
                        <StatisticChartAxes />
                        <Tooltip<number, string>
                            cursor={{fill: chartPalette.cursor}}
                            content={<StatisticChartTooltip labelsByDataKey={namesMap} />}
                            isAnimationActive={false}
                        />

                        {employeeIds.map((id, index) => {
                            const seriesStyle = getChartSeriesStyle(index);

                            return (
                                <Bar
                                    key={id}
                                    dataKey={id}
                                    name={namesMap[id] ?? id}
                                    stackId="payroll"
                                    fill={seriesStyle.color}
                                    fillOpacity={seriesStyle.fillOpacity}
                                    stroke={seriesStyle.color}
                                    strokeWidth={seriesStyle.dashArray ? 2 : 0}
                                    strokeDasharray={seriesStyle.dashArray}
                                    radius={index === employeeIds.length - 1 ? [4, 4, 0, 0] : [0, 0, 0, 0]}
                                    isAnimationActive={false}
                                />
                            );
                        })}
                    </BarChart>
                </ResponsiveContainer>
            </Box>
        </Box>
    );
};
