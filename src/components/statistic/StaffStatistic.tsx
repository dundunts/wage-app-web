"use client";

import { Payroll } from "@/types/salary.types";
import {
    calculateByDays,
    calculateSummary,
    groupByEmployee,
} from "@/utils/payrollCalculations";
import {
    Box,
    SimpleGrid,
    Stat,
    Accordion,
    AccordionItem,
    Text, Span,
} from "@chakra-ui/react";
import { PayrollChart } from "./PayrollCharts";
import { useMemo } from "react";

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
                    <Stat.Label>Средний доход за день</Stat.Label>
                    <Stat.ValueText>{summary.avgTotal.toFixed(2)}</Stat.ValueText>
                </Stat.Root>

                <Stat.Root>
                    <Stat.Label>Макс / Мин за день</Stat.Label>
                    <Stat.ValueText>
                        {summary.max.toFixed(2)} / {summary.min.toFixed(2)}
                    </Stat.ValueText>
                </Stat.Root>
            </SimpleGrid>

            <PayrollChart
                days={days}
                type="line"
                title="Общий доход по дням"
            />

            <Box mt={8}>
                <Accordion.Root multiple defaultValue={["b"]}>
                    {[...employees.values()].map((employeeStat) => (
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
