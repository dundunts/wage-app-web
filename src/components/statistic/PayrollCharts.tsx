"use client";

import {
    LineChart,
    Line,
    XAxis,
    YAxis,
    Tooltip,
    CartesianGrid,
    ResponsiveContainer,
    BarChart,
    Bar,
} from "recharts";
import { Box, Heading } from "@chakra-ui/react";
import { DayStat } from "@/utils/payrollCalculations";

interface Props {
    days: DayStat[];
    type: "line" | "bar";
    title: string;
}

export function PayrollChart({ days, type, title }: Props) {
    return (
        <Box mt={6} w="100%" h="320px">
            <Heading size="sm" mb={2}>
                {title}
            </Heading>

            <ResponsiveContainer width="100%" height="100%">
                {type === "line" ? (
                    <LineChart data={days}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Line dataKey="total" strokeWidth={2} />
                    </LineChart>
                ) : (
                    <BarChart data={days}>
                        <CartesianGrid strokeDasharray="3 3" />
                        <XAxis dataKey="date" />
                        <YAxis />
                        <Tooltip />
                        <Bar dataKey="total" />
                    </BarChart>
                )}
            </ResponsiveContainer>
        </Box>
    );
}
