"use client";

import { useEffect, useState } from "react";
import {Payroll, PeriodType} from "@/types/salary.types";
import { getOwnSalary, getStaffSalary } from "@/service/salary/salary.service";
import { StatisticFilters } from "@/hooks/useStatisticFilter";
import { StatisticScope } from "@/types/salary.types";
import {toaster} from "@/components/ui/toaster";

interface UseSalaryStatisticResult {
    data: Payroll | null;
    isLoading: boolean;
}

export function useSalaryStatistic(filters: StatisticFilters): UseSalaryStatisticResult {
    const [data, setData] = useState<Payroll | null>(null);
    const [isLoading, setIsLoading] = useState(false);

    useEffect(() => {
        if (!filters.companyId) return;

        const load = async () => {
            try {
                setIsLoading(true);

                const commonParams = {
                    companyId: filters.companyId,
                    periodType: filters.periodType as PeriodType,
                    start: filters.start || undefined,
                    end: filters.end || undefined,
                };

                const result =
                    filters.scope === StatisticScope.STAFF
                        ? await getStaffSalary(commonParams)
                        : await getOwnSalary(commonParams);

                setData(result);
            } catch (e) {
                console.error(e);
                toaster.create({
                    title: "Ошибка загрузки статистики",
                    type: "error",
                    duration: 4000,
                    closable: true,
                });
                setData(null);
            } finally {
                setIsLoading(false);
            }
        };

        load();
    }, [
        filters.companyId,
        filters.scope,
        filters.periodType,
        filters.start,
        filters.end,
    ]);

    return { data, isLoading };
}
