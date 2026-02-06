"use client";

import { Box, Heading, Spinner, Center, Text } from "@chakra-ui/react";
import { StatisticFilters } from "@/components/statistic/StatisticFilters";
import { useStatisticFilters } from "@/hooks/useStatisticFilter";
import { useSalaryStatistic } from "@/hooks/useSalaryStatistic";
import {StatisticScope} from "@/types/salary.types";
import {OwnStatistic} from "@/components/statistic/OwnStatistic";
import {StaffStatistic} from "@/components/statistic/StaffStatistic";

export default function StatisticPage() {
    const { filters } = useStatisticFilters();
    const { data, isLoading } = useSalaryStatistic(filters);

    return (
        <Box p={6}>
            <Heading size="lg" mb={6}>
                Статистика зарплат
            </Heading>

            <StatisticFilters />

            <Box mt={8}>
                {isLoading && (
                    <Center py={10}>
                        <Spinner size="lg" />
                    </Center>
                )}

                {!isLoading && !data && (
                    <Center py={10}>
                        <Text color="gray.500">
                            Нет данных за выбранный период
                        </Text>
                    </Center>
                )}

                {!isLoading && data && (
                    <Text color="gray.500">
                        Данные загружены ({data.elements.length} элементов)
                    </Text>
                )}

                {!isLoading && data && (
                    filters.scope === StatisticScope.OWN ? (
                        <OwnStatistic payroll={data} />
                    ) : (
                        <StaffStatistic payroll={data} />
                    )
                )}
            </Box>
        </Box>
    );
}
