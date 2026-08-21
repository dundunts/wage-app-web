"use client";

import {useMemo} from "react";
import {
    Box,
    createListCollection,
    Grid,
    Input,
    Portal,
    Select,
} from "@chakra-ui/react";
import {Field} from "@/components/ui/field";
import {ShiftResultFilters} from "@/hooks/useShiftResultFilters";
import {Company} from "@/types/company.types";
import {PeriodType} from "@/types/enums";

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

const periodOptions = [
    {label: "Предыдущий", value: PeriodType.PREVIOUS},
    {label: "Текущий", value: PeriodType.CURRENT},
    {label: "Выбор дат", value: PeriodType.CUSTOM},
];

export function ResultsFilters({
    companies,
    filters,
    onFilterChange,
}: ResultsFiltersProps) {
    const isCustomPeriod = filters.periodType === PeriodType.CUSTOM;
    const companiesCollection = useMemo(() => createListCollection({
        items: companies.map((company) => ({label: company.title, value: company.id})),
    }), [companies]);
    const periodsCollection = useMemo(() => createListCollection({
        items: periodOptions,
    }), []);

    if (companies.length === 0) {
        return (
            <Box
                role="status"
                color="status.warning"
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border"
                borderRadius="panel"
                p={4}
            >
                Нет доступных компаний
            </Box>
        );
    }

    return (
        <Grid
            as="section"
            aria-label="Фильтры результатов смен"
            gap={4}
            templateColumns={{base: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "1.2fr 1fr 1fr 1fr"}}
            alignItems="end"
            mb={6}
            p={{base: 4, md: 5}}
            bg="bg.panel"
            borderWidth="1px"
            borderColor="border"
            borderRadius="panel"
            boxShadow="panel"
        >
            <Select.Root
                collection={companiesCollection}
                value={filters.companyId ? [filters.companyId] : []}
                onValueChange={(details) => onFilterChange("companyId", details.value[0] ?? "")}
                width="full"
            >
                <Select.HiddenSelect />
                <Select.Label>Компания</Select.Label>
                <Select.Control>
                    <Select.Trigger
                        bg="bg.raised"
                        borderColor="border"
                        focusRingColor="focus.ring"
                        _hover={{borderColor: "border.emphasized"}}
                    >
                        <Select.ValueText placeholder="Выберите компанию" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                        <Select.Indicator />
                    </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                    <Select.Positioner>
                        <Select.Content>
                            {companiesCollection.items.map((company) => (
                                <Select.Item item={company} key={company.value}>
                                    {company.label}
                                    <Select.ItemIndicator />
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Positioner>
                </Portal>
            </Select.Root>

            <Select.Root
                collection={periodsCollection}
                value={[filters.periodType]}
                onValueChange={(details) => onFilterChange("periodType", details.value[0] ?? "")}
                width="full"
            >
                <Select.HiddenSelect />
                <Select.Label>Период</Select.Label>
                <Select.Control>
                    <Select.Trigger
                        bg="bg.raised"
                        borderColor="border"
                        focusRingColor="focus.ring"
                        _hover={{borderColor: "border.emphasized"}}
                    >
                        <Select.ValueText placeholder="Выберите период" />
                    </Select.Trigger>
                    <Select.IndicatorGroup>
                        <Select.Indicator />
                    </Select.IndicatorGroup>
                </Select.Control>
                <Portal>
                    <Select.Positioner>
                        <Select.Content>
                            {periodsCollection.items.map((period) => (
                                <Select.Item item={period} key={period.value}>
                                    {period.label}
                                    <Select.ItemIndicator />
                                </Select.Item>
                            ))}
                        </Select.Content>
                    </Select.Positioner>
                </Portal>
            </Select.Root>

            <Field label="Начало">
                <Input
                    type="date"
                    value={filters.start ?? ""}
                    disabled={!isCustomPeriod}
                    onChange={(event) => onFilterChange("start", event.target.value)}
                />
            </Field>

            <Field label="Конец">
                <Input
                    type="date"
                    value={filters.end ?? ""}
                    disabled={!isCustomPeriod}
                    onChange={(event) => onFilterChange("end", event.target.value)}
                />
            </Field>
        </Grid>
    );
}
