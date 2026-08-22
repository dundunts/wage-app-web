"use client";

import { HStack, Input, Field } from "@chakra-ui/react";
import { StatisticFilters } from "@/hooks/useStatisticFilter";

interface Props {
    filters: StatisticFilters;
    setFilter: (
        key: keyof StatisticFilters,
        value: string | number | undefined
    ) => void;
}

export function StatisticDateRange({ filters, setFilter }: Props) {
    return (
        <HStack gap={4} mt={4} align="start" flexWrap="wrap">
            <Field.Root maxW={{base: "100%", md: "220px"}}>
                <Field.Label>Начало периода</Field.Label>
                <Input
                    type="date"
                    value={filters.start || ""}
                    onChange={(e) =>
                        setFilter("start", e.target.value || undefined)
                    }
                />
            </Field.Root>

            <Field.Root maxW={{base: "100%", md: "220px"}}>
                <Field.Label>Конец периода</Field.Label>
                <Input
                    type="date"
                    value={filters.end || ""}
                    min={filters.start}
                    onChange={(e) =>
                        setFilter("end", e.target.value || undefined)
                    }
                />
            </Field.Root>
        </HStack>
    );
}
