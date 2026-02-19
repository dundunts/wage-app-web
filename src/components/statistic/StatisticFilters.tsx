"use client";

import {Box, createListCollection, HStack, Portal, Select, Spinner, Tabs} from "@chakra-ui/react";
import { useAllCompanies } from "@/hooks/useAllCompanies";
import { useStatisticFilters } from "@/hooks/useStatisticFilter";
import { PeriodType, StatisticScope } from "@/types/salary.types";
import { StatisticDateRange } from "@/components/statistic/StatisticDateRange";

export function StatisticFilters() {
    const { companies, isLoading } = useAllCompanies();
    const defaultCompanyId = companies[0]?.id;
    const { filters, setFilter } = useStatisticFilters(defaultCompanyId);

    if (isLoading) {
        return <Spinner />;
    }

    const companiesCollection = createListCollection({
        items: companies,
        itemToValue: c => c.id,
        itemToString: c => c.title
    })

    const periodTypesCollection = createListCollection({
        items: Object.values(PeriodType)
    })

    return (
        <Box>
            <HStack gap={4} flexWrap="wrap">
                <Select.Root
                    collection={companiesCollection}
                    width="320px"
                    value={[filters.companyId]}
                    onValueChange={(e) => setFilter("companyId", e.value[0] || "")}
                >
                    <Select.HiddenSelect />
                    <Select.Label>Select framework</Select.Label>
                    <Select.Control>
                        <Select.Trigger>
                            <Select.ValueText placeholder="Select company" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                            <Select.Indicator />
                        </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                        <Select.Positioner>
                            <Select.Content>
                                {companiesCollection.items.map((company) => (
                                    <Select.Item item={company} key={company.id}>
                                        {company.title}
                                        <Select.ItemIndicator />
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Positioner>
                    </Portal>
                </Select.Root>

                <Select.Root
                    collection={periodTypesCollection}
                    width="320px"
                    value={[filters.periodType]}
                    // value={[Object.values(PeriodType).find(v => v.toString() === filters.periodType) || ""]}
                    onValueChange={(e) => {
                        const value = e.value[0];
                        console.log("Picked period type", value)
                        setFilter("periodType", value);

                        // if (value !== PeriodType.CUSTOM) {
                        //     setFilter("start", undefined);
                        //     setFilter("end", undefined);
                        // }
                    }}
                >
                    <Select.HiddenSelect />
                    <Select.Label>Select period type</Select.Label>
                    <Select.Control>
                        <Select.Trigger>
                            <Select.ValueText placeholder="Select period type" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                            <Select.Indicator />
                        </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                        <Select.Positioner>
                            <Select.Content>
                                {periodTypesCollection.items.map((pt) => (
                                    <Select.Item item={pt.toString()} key={pt}>
                                        {pt}
                                        <Select.ItemIndicator />
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Positioner>
                    </Portal>
                </Select.Root>
            </HStack>

            {filters.periodType === PeriodType.CUSTOM && (
                <StatisticDateRange
                    filters={filters}
                    setFilter={setFilter}
                />
            )}

            <Tabs.Root
                mt={4}
                value={filters.scope}
                onValueChange={(details) =>
                    setFilter(
                        "scope",
                        details.value as StatisticScope
                    )
                }
                size="sm"
                variant="subtle"
            >
                <Tabs.List>
                    <Tabs.Trigger value={StatisticScope.OWN}>
                        Личная
                    </Tabs.Trigger>
                    <Tabs.Trigger value={StatisticScope.STAFF}>
                        Общая
                    </Tabs.Trigger>
                </Tabs.List>
            </Tabs.Root>
        </Box>
    );
}
