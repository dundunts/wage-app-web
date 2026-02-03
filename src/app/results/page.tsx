// @/app/results/page.tsx
"use client";

import { useEffect, useState, useTransition } from "react";
import { Box, Heading, Button, Container, Flex, useDialog } from "@chakra-ui/react"; // Note: useDialog is conceptual, implementing basic confirm below
import { getUserCompanies } from "@/service/company/company.service";
import { getShiftResultsByPeriodPage, deleteShiftResult } from "@/service/results/shiftResult.service";
import { Company } from "@/types/company.types";
import { Page } from "@/types/common.types"; // (Assuming Page is exported from common)
import { useShiftResultFilters } from "./_hooks/useShiftResultFilters";
import { ResultsFilters } from "./_components/ResultsFilters";
import { ResultsTable } from "./_components/ResultsTable";
import { Toaster, toaster } from "@/components/ui/toaster";
import {ShiftResultDetailed} from "@/types/shiftResult.types";
import {ShiftResultModal} from "@/app/results/_components/ShiftResultModal"; // Предполагаю наличие тостера

export default function ResultsPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [resultsPage, setResultsPage] = useState<Page<ShiftResultDetailed> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isPending, startTransition] = useTransition();
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [targetForEdit, setTargetForEdit] = useState<ShiftResultDetailed | null>(null)
    const isEditDialogOpen = targetForEdit !== null

    // Инициализация хука фильтров (defaultCompanyId будет применен после загрузки компаний)
    const { filters, setFilter } = useShiftResultFilters(companies[0]?.id);

    // 1. Загрузка компаний при маунте
    useEffect(() => {
        getUserCompanies()
            .then((data) => {
                setCompanies(data);
                if (data.length > 0 && !filters.companyId) {
                    setFilter("companyId", data[0].id);
                }
            })
            .catch((err) => console.error("Failed to load companies", err));
    }, []);

    // 2. Загрузка результатов при изменении фильтров
    useEffect(() => {
        function init() {
            if (!filters.companyId) return;

            setIsLoading(true);
            getShiftResultsByPeriodPage({
                companyId: filters.companyId,
                periodType: filters.periodType,
                now: new Date().toISOString(),
                start: filters.start || undefined,
                end: filters.end || undefined,
                page: filters.page,
                size: filters.size
            })
                .then(setResultsPage)
                .catch((e) => {
                    toaster.create({ title: "Ошибка загрузки данных", type: "error" });
                })
                .finally(() => setIsLoading(false));
        }

        init()
    }, [filters, companies]);

    const handleSaveSuccess = () => {
        // Перезагружаем данные
        // Можно вызвать рефетч функции, которая загружает таблицу
        // Для простоты:
        window.location.reload();
    };

    // Обработчик удаления
    const handleDelete = async (id: string) => {
        const confirmed = window.confirm("Вы уверены, что хотите удалить результат?"); // Для простоты пока нативный, позже заменим на Chakra Dialog
        if (!confirmed) return;

        startTransition(async () => {
            try {
                await deleteShiftResult(id);
                toaster.create({ title: "Удалено успешно", type: "success" });
                // Перезагрузка данных (триггер эффекта)
                // В идеале использовать React Query invalidate, но здесь просто перезапросим
                window.location.reload();
            } catch (e) {
                toaster.create({ title: "Ошибка удаления", type: "error" });
            }
        });
    };

    return (
        <Container maxW="7xl" py={8}>
            <Flex justify="space-between" align="center" mb={6}>
                <Heading size="2xl">Результаты смен</Heading>
                <Button colorPalette="blue" onClick={() => {setCreateModalOpen(true)}}>
                    Создать результат
                </Button>
            </Flex>

            <ResultsFilters
                companies={companies}
                filters={filters}
                onFilterChange={setFilter}
            />

            <ResultsTable
                data={resultsPage?.content || []}
                isLoading={isLoading || isPending}
                onEdit={data => setTargetForEdit(data)}
                onDelete={handleDelete}
            />

            {/* Пагинация (упрощенная) */}
            {resultsPage && resultsPage.totalPages > 1 && (
                <Flex gap={2} mt={4} justify="center">
                    <Button
                        disabled={filters.page === 0}
                        onClick={() => setFilter("page", filters.page - 1)}
                        variant="outline"
                    >
                        Назад
                    </Button>
                    <Button variant="ghost" disabled>
                        Стр. {filters.page + 1} из {resultsPage.totalPages}
                    </Button>
                    <Button
                        disabled={filters.page >= resultsPage.totalPages - 1}
                        onClick={() => setFilter("page", filters.page + 1)}
                        variant="outline"
                    >
                        Вперед
                    </Button>
                </Flex>
            )}

            <ShiftResultModal
                isOpen={isCreateModalOpen}
                onClose={() => setCreateModalOpen(false)}
                onSuccess={handleSaveSuccess}
                companies={companies}
                initialData={null} // null для создания
            />

            { targetForEdit &&
                <ShiftResultModal
                    isOpen={isEditDialogOpen}
                    onClose={() => setTargetForEdit(null)}
                    onSuccess={handleSaveSuccess}
                    companies={companies}
                    initialData={{ result: targetForEdit, companyId: filters.companyId }} // null для создания
                />
            }
        </Container>
    );
}