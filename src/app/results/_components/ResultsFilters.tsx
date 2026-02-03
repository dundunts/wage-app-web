// @/app/results/_components/ResultsFilters.tsx
"use client";

import {Box, Flex, Select, Input, Text, createListCollection} from "@chakra-ui/react";
import { Company } from "@/types/company.types";
import {PeriodType} from "@/types/enums";
import {ShiftResultFilters} from "@/app/results/_hooks/useShiftResultFilters";

interface ResultsFiltersProps {
    companies: Company[];
    filters: {
        companyId: string;
        periodType: string;
        start?: string;
        end?: string;
    };
    onFilterChange: (key: keyof ShiftResultFilters, value: string) => void;
}

export function ResultsFilters({
                                   companies,
                                   filters,
                                   onFilterChange,
                               }: ResultsFiltersProps) {
    const isCustomPeriod = filters.periodType === PeriodType.CUSTOM;

    if (companies.length === 0) {
        return <Text color="red.500">Нет доступных компаний</Text>;
    }

    const companiesCollection = createListCollection({
        items: companies.map(c => ({ label: c.title, value: c.id }))
    })

    return (
        <Flex gap={4} wrap="wrap" align="end" mb={6}>
            {/* Выбор компании */}
            <Box minW="200px">
                <Text fontSize="sm" mb={1} fontWeight="medium">Компания</Text>
                <Select.Root
                    collection={companiesCollection} // В Chakra v3 используется collection, но для простоты нативного select:
                    value={[filters.companyId]}
                    onValueChange={(e) => onFilterChange("companyId", e.value[0])}
                >
                    {/* Note: Chakra v3 Select is complex. Using NativeSelect for simplicity or assuming wrapper.
                 Below is generic NativeSelect approach for v3 compatibility via standard HTML select wrap
                 if specific UI kit not provided. I will use standard Select logic. */}
                    <select
                        style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px' }}
                        value={filters.companyId}
                        onChange={(e) => onFilterChange("companyId", e.target.value)}
                    >
                        {companies.map((c) => (
                            <option key={c.id} value={c.id}>{c.title}</option>
                        ))}
                    </select>
                </Select.Root>
            </Box>

            {/* Тип периода */}
            <Box minW="150px">
                <Text fontSize="sm" mb={1} fontWeight="medium">Период</Text>
                <select
                    style={{ padding: '8px', border: '1px solid #ccc', borderRadius: '4px', width: '100%' }}
                    value={filters.periodType}
                    onChange={(e) => onFilterChange("periodType", e.target.value)}
                >
                    <option value={PeriodType.PREVIOUS}>Предыдущий</option>
                    <option value={PeriodType.CURRENT}>Текущий</option>
                    <option value={PeriodType.CUSTOM}>Выбор дат</option>
                </select>
            </Box>

            {/* Даты (активны только если Custom) */}
            <Box>
                <Text fontSize="sm" mb={1} fontWeight="medium">Начало</Text>
                <Input
                    type="date"
                    value={filters.start}
                    disabled={!isCustomPeriod}
                    onChange={(e) => onFilterChange("start", e.target.value)}
                />
            </Box>

            <Box>
                <Text fontSize="sm" mb={1} fontWeight="medium">Конец</Text>
                <Input
                    type="date"
                    value={filters.end}
                    disabled={!isCustomPeriod}
                    onChange={(e) => onFilterChange("end", e.target.value)}
                />
            </Box>
        </Flex>
    );
}