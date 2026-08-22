// @/hooks/useStatisticFilter.ts
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import {useCallback, useEffect, useMemo} from "react";
import {PeriodType} from "@/types/enums";
import {StatisticScope} from "@/types/salary.types";

export interface StatisticFilters {
    companyId: string;
    scope: string;
    periodType: string;
    start?: string;
    end?: string;
}

export function useStatisticFilters(defaultCompanyId?: string) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Получаем текущие значения или дефолтные
    const filters: StatisticFilters = useMemo(() => {
        return {
            companyId: searchParams.get("companyId") || defaultCompanyId || "",
            periodType: searchParams.get("periodType") || PeriodType.PREVIOUS,
            scope: searchParams.get("scope") || StatisticScope.OWN,
            start: searchParams.get("start") || "",
            end: searchParams.get("end") || "",
        };
    }, [searchParams, defaultCompanyId]);

    useEffect(() => {
        if (!searchParams.get("companyId") && defaultCompanyId) {
            const params = new URLSearchParams(searchParams.toString());
            params.set("companyId", defaultCompanyId);
            router.replace(`${pathname}?${params.toString()}`);
        }
    }, [defaultCompanyId, searchParams, pathname, router]);

    // Функция обновления любого параметра
    const setFilter = useCallback(
        (key: keyof StatisticFilters, value: string | number | undefined) => {
            const params = new URLSearchParams(searchParams.toString());

            if (value === undefined || value === null || value === "") {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }

            router.push(`${pathname}?${params.toString()}`);
        },
        [router, pathname, searchParams]
    );

    return { filters, setFilter };
}
