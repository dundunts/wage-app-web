// @/app/(admin)/company/page.tsx
"use client";

import {useCallback, useEffect, useState} from "react";
import {useSearchParams} from "next/navigation";
import {Center, Spinner, Text} from "@chakra-ui/react";
import {CompanyList} from "@/components/company/company-list";
import {companyService} from "@/service/company/company.service";
import {Company} from "@/types/company.types";
import {Page} from "@/types/common.types";

export default function CompanyPage() {
    const searchParams = useSearchParams();

    // Состояние данных
    const [data, setData] = useState<Page<Company> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Параметры пагинации из URL
    const page = parseInt(searchParams.get("page") || "0", 10);
    const size = parseInt(searchParams.get("size") || "10", 10);
    const sort = searchParams.get("sort") || "id,desc";

    // Функция загрузки данных
    const fetchData = useCallback(async () => {
        setIsLoading(true);
        setError(null);

        try {
            // Здесь мы вызываем сервисный метод.
            // Токен берется автоматически браузером (куки) или обрабатывается внутри fetch/api route
            const result = await companyService.getPage({page, size, sort});
            setData(result);
        } catch (err) {
            console.error("Failed to load companies:", err);
            setError("Не удалось загрузить список компаний.");
        } finally {
            setIsLoading(false);
        }
    }, [page, size, sort]);

    // Эффект для загрузки при смене параметров или аутентификации
    useEffect(() => {
        fetchData();
    }, [fetchData]);

    if (error && !data) {
        return (
            <Center h="100vh">
                <Text color="red.500">{error}</Text>
            </Center>
        )
    }

    return (
        <CompanyList
            data={data}
            isLoadingData={isLoading}
            onRefresh={fetchData}
        />
    );
}