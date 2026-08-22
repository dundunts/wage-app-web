// @/app/results/page.tsx
"use client";

import {useEffect, useRef, useState} from "react";
import {Button, Container, Flex, Heading, Stack, Text} from "@chakra-ui/react";
import {companyService} from "@/service/company/company.service";
import {shiftResultService} from "@/service/results/shiftResult.service";
import {Company} from "@/types/company.types";
import {Page} from "@/types/common.types"; // (Assuming Page is exported from common)
import {useShiftResultFilters} from "../../../hooks/useShiftResultFilters";
import {ResultsFilters} from "../../../components/results/ResultsFilters";
import {ResultsTable} from "../../../components/results/ResultsTable";
import {ShiftResultDetailed} from "@/types/shiftResult.types";
import {ShiftResultModal} from "@/components/results/ShiftResultModal";
import {salaryService} from "@/service/salary/salary.service";
import {PeriodType} from "@/types/salary.types"; // Предполагаю наличие тостера
import {ConfirmationDialog} from "@/components/dialog/ConfirmationDialog";
import {feedback} from "@/feedback/feedback";
import {downloadFile} from "@/utils/download-file";
import {feedbackMessages} from "@/feedback/messages";

export default function ResultsPage() {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [resultsPage, setResultsPage] = useState<Page<ShiftResultDetailed> | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isCreateModalOpen, setCreateModalOpen] = useState(false);
    const [targetForEdit, setTargetForEdit] = useState<{
        result: ShiftResultDetailed;
        trigger: HTMLButtonElement | null;
    } | null>(null)
    const [resultsRevision, setResultsRevision] = useState(0);
    const [deleteTarget, setDeleteTarget] = useState<{
        id: string;
        trigger: HTMLButtonElement | null;
    } | null>(null);
    const [isDeletePending, setDeletePending] = useState(false);
    const [isDownloadPending, setDownloadPending] = useState(false);
    const createTriggerRef = useRef<HTMLButtonElement>(null);
    const isEditDialogOpen = targetForEdit !== null

    // Инициализация хука фильтров (defaultCompanyId будет применен после загрузки компаний)
    const { filters, setFilter } = useShiftResultFilters(companies[0]?.id);

    // 1. Загрузка компаний при маунте
    useEffect(() => {
        // getUserCompanies()
        companyService.getForUser()
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
            shiftResultService.getPageByPeriod({
                companyId: filters.companyId,
                periodType: filters.periodType,
                now: new Date().toISOString(),
                start: filters.start || undefined,
                end: filters.end || undefined,
                page: filters.page,
                size: filters.size
            })
                .then(setResultsPage)
                .catch((error) => {
                    feedback.beginAction("shiftResultListLoad").error(error);
                })
                .finally(() => setIsLoading(false));
        }

        init()
    }, [filters, resultsRevision]);

    const handleSaveSuccess = () => {
        setResultsRevision((revision) => revision + 1);
    };

    // Обработчик удаления
    const openDeleteDialog = (id: string, trigger: HTMLButtonElement | null) => {
        setDeleteTarget({id, trigger});
    };

    const closeDeleteDialog = () => {
        if (!isDeletePending) {
            setDeleteTarget(null);
        }
    };

    const handleDelete = async () => {
        if (!deleteTarget || isDeletePending) return;

        const actionFeedback = feedback.beginAction("shiftResultDelete");
        setDeletePending(true);
        try {
            await shiftResultService.delete(deleteTarget.id);
            actionFeedback.success();
            setDeleteTarget(null);
            setResultsRevision((revision) => revision + 1);
        } catch (error) {
            actionFeedback.error(error);
        } finally {
            setDeletePending(false);
        }
    };

    const handleDownload = () => {
        if (isDownloadPending) return;

        const actionFeedback = feedback.beginAction("payrollExport").loading();
        const downloadParameters = {
            companyId: filters.companyId,
            periodType: filters.periodType as PeriodType,
            now: new Date().toISOString(),
            start: filters.start || undefined,
            end: filters.end || undefined,
        };
        const performDownload = async () => {
            setDownloadPending(true);
            try {
                const blob = await salaryService.downloadReportTable(downloadParameters);
                downloadFile(blob, "salary-report.xlsx");
                actionFeedback.success();
            } catch (error) {
                actionFeedback.retryableError(error, performDownload);
            } finally {
                setDownloadPending(false);
            }
        };

        void performDownload();
    };

    return (
        <Container maxW="7xl" px={{base: 4, md: 6}} py={{base: 6, md: 8}}>
            <Flex
                justify="space-between"
                align={{base: "stretch", md: "end"}}
                direction={{base: "column", md: "row"}}
                gap={4}
                mb={6}
            >
                <Stack gap={1}>
                    <Text color="accent" fontSize="xs" fontWeight="bold" letterSpacing="wide" textTransform="uppercase">
                        Shift Result · Payroll
                    </Text>
                    <Heading as="h1" size={{base: "xl", md: "2xl"}}>Результаты смен</Heading>
                </Stack>

                <Flex gap={2} direction={{base: "column", sm: "row"}}>
                    <Button
                        ref={createTriggerRef}
                        colorPalette="brand"
                        onClick={() => {setCreateModalOpen(true)}}
                    >
                        Создать результат
                    </Button>
                    <Button
                        variant="outline"
                        onClick={handleDownload}
                        loading={isDownloadPending}
                        loadingText={feedbackMessages.payrollExport.loading}
                        disabled={!filters.companyId || isDownloadPending}
                    >
                        Скачать Excel
                    </Button>
                </Flex>
            </Flex>

            <ResultsFilters
                companies={companies}
                filters={filters}
                onFilterChange={setFilter}
            />

            <ResultsTable
                data={resultsPage?.content || []}
                isLoading={isLoading}
                onEdit={(result, trigger) => setTargetForEdit({result, trigger})}
                onDelete={openDeleteDialog}
            />

            <ConfirmationDialog
                open={deleteTarget !== null}
                title="Удалить результат смены?"
                description="Результат смены будет удалён без возможности восстановления."
                confirmLabel="Удалить"
                cancelLabel="Отмена"
                pendingLabel={feedbackMessages.shiftResultDelete.loading}
                severity="danger"
                pending={isDeletePending}
                finalFocusEl={() => deleteTarget?.trigger ?? null}
                onCancel={closeDeleteDialog}
                onConfirm={handleDelete}
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
                    <Button variant="subtle" disabled>
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
                finalFocusEl={() => createTriggerRef.current}
            />

            { targetForEdit &&
                <ShiftResultModal
                    isOpen={isEditDialogOpen}
                    onClose={() => setTargetForEdit(null)}
                    onSuccess={handleSaveSuccess}
                    companies={companies}
                    initialData={{ result: targetForEdit.result, companyId: filters.companyId }}
                    finalFocusEl={() => targetForEdit.trigger}
                />
            }
        </Container>
    );
}
