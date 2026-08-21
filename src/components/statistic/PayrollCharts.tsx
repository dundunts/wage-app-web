"use client";

import {Box, Heading, HStack, Text} from "@chakra-ui/react";
import {useId, type ReactNode} from "react";
import {
    Bar,
    BarChart,
    CartesianGrid,
    Line,
    LineChart,
    ResponsiveContainer,
    Tooltip,
    XAxis,
    YAxis,
} from "recharts";
import type {TooltipContentProps} from "recharts";
import {chartPalette} from "@/theme/chart";
import {DayStat} from "@/utils/payrollCalculations";

interface Props {
    days: DayStat[];
    type: "line" | "bar";
    title: string;
}

interface ChartLegendItem {
    color: string;
    dashArray?: string;
    id: string;
    label: string;
}

interface StatisticChartTooltipProps extends Partial<TooltipContentProps<number, string>> {
    labelsByDataKey?: Record<string, string>;
}

const numberFormatter = new Intl.NumberFormat("ru-RU", {
    maximumFractionDigits: 2,
});

export function StatisticChartLegend({items}: {items: ChartLegendItem[]}) {
    return (
        <HStack as="ul" gap={{base: 3, md: 5}} flexWrap="wrap" listStyleType="none" m={0} p={0}>
            {items.map((item) => (
                <HStack as="li" key={item.id} gap={2} color="fg.muted" fontSize="sm">
                    <Box
                        aria-hidden="true"
                        w="0.9rem"
                        h={item.dashArray ? "0.25rem" : "0.65rem"}
                        borderRadius="2px"
                        bg={item.dashArray ? "transparent" : item.color}
                        borderTopWidth={item.dashArray ? "2px" : "0"}
                        borderTopStyle={item.dashArray ? "dashed" : "solid"}
                        borderTopColor={item.color}
                    />
                    <Text>{item.label}</Text>
                </HStack>
            ))}
        </HStack>
    );
}

interface StatisticChartFrameProps {
    children: ReactNode;
    description: string;
    height: {base: string; md: string};
    legendItems: ChartLegendItem[];
    title: string;
}

export function StatisticChartFrame({
    children,
    description,
    height,
    legendItems,
    title,
}: StatisticChartFrameProps) {
    const titleId = useId();
    const descriptionId = useId();

    return (
        <Box
            as="figure"
            aria-labelledby={titleId}
            aria-describedby={descriptionId}
            mt={6}
            minW={0}
            w="100%"
            overflow="hidden"
            layerStyle="panel"
            p={{base: 3, md: 5}}
            fontFamily="body"
            fontVariantNumeric="tabular-nums"
        >
            <Heading id={titleId} size="sm">
                {title}
            </Heading>
            <Text id={descriptionId} color="fg.muted" fontSize="xs" mt={1} mb={3}>
                {description}
            </Text>
            <StatisticChartLegend items={legendItems} />
            <Box h={height} minW={0} mt={2}>
                {children}
            </Box>
        </Box>
    );
}

export function StatisticChartTooltip({
    active,
    label,
    labelsByDataKey = {},
    payload = [],
}: StatisticChartTooltipProps) {
    if (!active || payload.length === 0) {
        return null;
    }

    return (
        <Box
            borderWidth="1px"
            borderColor="border"
            borderRadius="control"
            bg="bg.raised"
            color="fg"
            boxShadow="panel"
            px={3}
            py={2}
            fontFamily="body"
            fontVariantNumeric="tabular-nums"
        >
            <Text color="fg.muted" fontSize="xs" mb={1}>
                {label}
            </Text>
            {payload.map((item) => {
                const key = String(item.dataKey ?? item.name ?? "");
                const value = typeof item.value === "number"
                    ? numberFormatter.format(item.value)
                    : String(item.value ?? "");

                return (
                    <HStack key={key} justify="space-between" gap={4} fontSize="sm">
                        <Text color="fg.muted">{labelsByDataKey[key] ?? item.name ?? key}</Text>
                        <Text fontWeight="semibold">{value}</Text>
                    </HStack>
                );
            })}
        </Box>
    );
}

export const statisticAxisTick = {
    fill: chartPalette.axis,
    fontFamily: "var(--chakra-fonts-body)",
    fontSize: 11,
    fontVariantNumeric: "tabular-nums",
};

export function StatisticChartAxes() {
    return (
        <>
            <CartesianGrid stroke={chartPalette.grid} strokeDasharray="3 5" vertical={false} />
            <XAxis
                dataKey="date"
                tick={statisticAxisTick}
                tickLine={{stroke: chartPalette.grid}}
                axisLine={{stroke: chartPalette.grid}}
                minTickGap={16}
            />
            <YAxis
                tick={statisticAxisTick}
                tickLine={false}
                axisLine={false}
                width={64}
            />
        </>
    );
}

export function PayrollChart({days, type, title}: Props) {
    const description = type === "line"
        ? "Линейный график суммы выплат по датам. Основная серия: сумма выплат."
        : "Столбчатая диаграмма суммы выплат по датам. Основная серия: сумма выплат.";

    return (
        <StatisticChartFrame
            title={title}
            description={description}
            legendItems={[{id: "total", label: "Сумма выплат", color: chartPalette.primary}]}
            height={{base: "17rem", md: "20rem"}}
        >
            <ResponsiveContainer
                width="100%"
                height="100%"
                minWidth={0}
                minHeight={272}
                initialDimension={{width: 640, height: 320}}
            >
                    {type === "line" ? (
                        <LineChart data={days} accessibilityLayer margin={{top: 12, right: 8, left: 4, bottom: 0}}>
                            <StatisticChartAxes />
                            <Tooltip<number, string>
                                cursor={{stroke: chartPalette.primary, strokeDasharray: "3 5"}}
                                content={<StatisticChartTooltip labelsByDataKey={{total: "Сумма выплат"}} />}
                                isAnimationActive={false}
                            />
                            <Line
                                dataKey="total"
                                name="Сумма выплат"
                                stroke={chartPalette.primary}
                                strokeWidth={2.5}
                                dot={{r: 3, fill: chartPalette.surface, strokeWidth: 2}}
                                activeDot={{r: 5, strokeWidth: 2}}
                                isAnimationActive={false}
                            />
                        </LineChart>
                    ) : (
                        <BarChart data={days} accessibilityLayer margin={{top: 12, right: 8, left: 4, bottom: 0}}>
                            <StatisticChartAxes />
                            <Tooltip<number, string>
                                cursor={{fill: chartPalette.cursor}}
                                content={<StatisticChartTooltip labelsByDataKey={{total: "Сумма выплат"}} />}
                                isAnimationActive={false}
                            />
                            <Bar
                                dataKey="total"
                                name="Сумма выплат"
                                fill={chartPalette.primary}
                                radius={[4, 4, 0, 0]}
                                isAnimationActive={false}
                            />
                        </BarChart>
                    )}
            </ResponsiveContainer>
        </StatisticChartFrame>
    );
}
