"use client";

import {useEffect, useState} from "react";
import {Payroll, PeriodType, StatisticScope} from "@/types/salary.types";
import {salaryService} from "@/service/salary/salary.service";
import {StatisticFilters} from "@/hooks/useStatisticFilter";
import {feedback} from "@/feedback/feedback";
import {getPeriodValidationMessage} from "@/utils/period-validation";

interface UseSalaryStatisticResult {
    data: Payroll | null;
    isLoading: boolean;
    validationMessage: string | null;
}

export function useSalaryStatistic(filters: StatisticFilters): UseSalaryStatisticResult {
    const [data, setData] = useState<Payroll | null>(null);
    const [isLoading, setIsLoading] = useState(false);
    const validationMessage = getPeriodValidationMessage(filters);

    useEffect(() => {
        let active = true;
        setData(null);
        if (!filters.companyId || validationMessage) {
            setIsLoading(false);
            return;
        }

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

                if (active) setData(result);
            } catch (e) {
                if (active) {
                    feedback.beginAction("salaryStatisticLoad").error(e);
                    setData(null);
                }
            } finally {
                if (active) setIsLoading(false);
            }
        };

        void load();
        return () => { active = false; };
    }, [
        filters.companyId,
        filters.scope,
        filters.periodType,
        filters.start,
        filters.end,
        validationMessage,
    ]);

    return {
        data: validationMessage ? null : data,
        isLoading: !validationMessage && isLoading,
        validationMessage,
    };
}
