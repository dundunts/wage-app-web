"use client";

import {useEffect, useState} from "react";
import {Payroll, PeriodType, StatisticScope} from "@/types/salary.types";
import {salaryService} from "@/service/salary/salary.service";
import {StatisticFilters} from "@/hooks/useStatisticFilter";
import {feedback} from "@/feedback/feedback";

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
                        ? await salaryService.getStaff(commonParams)
                        : await salaryService.getOwn(commonParams);

                setData(result);
            } catch (e) {
                feedback.beginAction("salaryStatisticLoad").error(e);
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
