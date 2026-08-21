"use client";

import { Payroll } from "@/types/salary.types";
import {
    calculateByDays,
    calculateSummary,
} from "@/utils/payrollCalculations";
import {
    Box,
    FormatNumber,
    SimpleGrid,
    Stat,
} from "@chakra-ui/react";
import { PayrollChart } from "./PayrollCharts";
import {StatisticSummaryCard} from "./StatisticSummaryCard";
import { useMemo } from "react";

interface Props {
    payroll: Payroll;
}

export function OwnStatistic({ payroll }: Props) {
    const days = useMemo(
        () => calculateByDays(payroll.elements),
        [payroll.elements]
    );

    const summary = useMemo(
        () => calculateSummary(days),
        [days]
    );

    if (!summary) {
        return null;
    }

    return (
        <Box>
            <SimpleGrid as="section" aria-label="Сводка личной статистики" columns={{ base: 1, md: 3 }} gap={4}>
                <StatisticSummaryCard label="Сумма выплат">
                    <FormatNumber value={summary.total} style="currency" currency="RUB" maximumFractionDigits={2}/>
                </StatisticSummaryCard>

                <StatisticSummaryCard label="Средний доход за день">
                    <FormatNumber value={summary.avgTotal} style="currency" currency="RUB" maximumFractionDigits={2}/>
                </StatisticSummaryCard>

                <StatisticSummaryCard label="Количество дней">
                    {summary.days} <Stat.ValueUnit>дн.</Stat.ValueUnit>
                </StatisticSummaryCard>

                <StatisticSummaryCard label="Средний % за день">
                    <FormatNumber value={summary.avgPercent} style="currency" currency="RUB" maximumFractionDigits={2}/>
                </StatisticSummaryCard>

                <StatisticSummaryCard label="Средние чаевые">
                    <FormatNumber value={summary.avgTips} style="currency" currency="RUB" maximumFractionDigits={2}/>
                </StatisticSummaryCard>

                <StatisticSummaryCard label="Макс. / мин.">
                    <FormatNumber value={summary.max} style="currency" currency="RUB" maximumFractionDigits={2}/>
                    {" / "}
                    <FormatNumber value={summary.min} style="currency" currency="RUB" maximumFractionDigits={2}/>
                </StatisticSummaryCard>
            </SimpleGrid>

            <PayrollChart
                days={days}
                type="line"
                title="Доход по дням"
            />
        </Box>
    );
}
