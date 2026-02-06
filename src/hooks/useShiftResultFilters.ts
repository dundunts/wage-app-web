// @/app/results/_hooks/useShiftResultFilters.ts
"use client";

import { useSearchParams, useRouter, usePathname } from "next/navigation";
import { useCallback, useMemo } from "react";
import {PeriodType} from "@/types/enums";

export interface ShiftResultFilters {
    companyId: string;
    periodType: string;
    start?: string;
    end?: string;
    page: number;
    size: number;
}

export function useShiftResultFilters(defaultCompanyId?: string) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Получаем текущие значения или дефолтные
    const filters: ShiftResultFilters = useMemo(() => {
        return {
            companyId: searchParams.get("companyId") || defaultCompanyId || "",
            periodType: searchParams.get("periodType") || PeriodType.PREVIOUS,
            start: searchParams.get("start") || "",
            end: searchParams.get("end") || "",
            page: Number(searchParams.get("page")) || 0,
            size: Number(searchParams.get("size")) || 30,
        };
    }, [searchParams, defaultCompanyId]);

    // Функция обновления любого параметра
    const setFilter = useCallback(
        (key: keyof ShiftResultFilters, value: string | number | undefined) => {
            const params = new URLSearchParams(searchParams.toString());

            if (value === undefined || value === null || value === "") {
                params.delete(key);
            } else {
                params.set(key, String(value));
            }

            // При изменении фильтров (не пагинации) сбрасываем страницу на 0
            if (key !== "page") {
                params.set("page", "0");
            }

            router.push(`${pathname}?${params.toString()}`);
        },
        [router, pathname, searchParams]
    );

    return { filters, setFilter };
}