"use client";

import { Payroll } from "@/types/salary.types";
import {
    calculateByDays,
    calculateSummary,
} from "@/utils/payrollCalculations";
import {
    Box, FormatNumber,
    SimpleGrid,
    Stat,
    StatLabel,
} from "@chakra-ui/react";
import { PayrollChart } from "./PayrollCharts";
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
            <SimpleGrid columns={{ base: 1, md: 3 }} gap={4}>
                <Stat.Root>
                    <Stat.Label>Сумма выплат</Stat.Label>
                    <Stat.ValueText>
                        <FormatNumber value={summary.total} style="currency" currency="RUB" maximumFractionDigits={2}/>
                    </Stat.ValueText>
                </Stat.Root>

                <Stat.Root>
                    <StatLabel>Средний доход за день</StatLabel>
                    <Stat.ValueText>
                        <FormatNumber value={summary.avgTotal} style="currency" currency="RUB" maximumFractionDigits={2}/>
                    </Stat.ValueText>
                </Stat.Root>

                <Stat.Root>
                    <StatLabel>Кол-во дней</StatLabel>
                    <Stat.ValueText alignItems="baseline">
                        {summary.days} <Stat.ValueUnit>days</Stat.ValueUnit>
                    </Stat.ValueText>
                </Stat.Root>

                <Stat.Root>
                    <StatLabel>Средний % за день</StatLabel>
                    <FormatNumber value={summary.avgPercent} style="currency" currency="RUB" maximumFractionDigits={2}/>
                </Stat.Root>

                <Stat.Root>
                    <StatLabel>Средние чаевые</StatLabel>
                    <FormatNumber value={summary.avgTips} style="currency" currency="RUB" maximumFractionDigits={2}/>
                </Stat.Root>

                <Stat.Root>
                    <StatLabel>Макс / Мин</StatLabel>
                    <FormatNumber value={summary.max} style="currency" currency="RUB" maximumFractionDigits={2}/>
                    /
                    <FormatNumber value={summary.min} style="currency" currency="RUB" maximumFractionDigits={2}/>
                </Stat.Root>
            </SimpleGrid>

            <PayrollChart
                days={days}
                type="line"
                title="Доход по дням"
            />
        </Box>
    );
}
