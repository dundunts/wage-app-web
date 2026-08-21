// @/app/(admin)/company/[id]/page.tsx
"use client";

import {useCallback, useEffect, useRef, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {Box, Button, Card, Center, Container, Separator, Spinner, Stack, Text} from "@chakra-ui/react";
import {ArrowLeft, Edit, Trash2} from "lucide-react";

import {Company, CompanyPayload} from "@/types/company.types";
import {companyService} from "@/service/company/company.service";
import {CompanyFormModal} from "@/components/company/company-form-modal";
import {ConfirmationDialog} from "@/components/dialog/ConfirmationDialog";
import {feedback} from "@/feedback/feedback";
import {feedbackMessages} from "@/feedback/messages";
import {PageHeader} from "@/components/page/PageHeader";
import {EmptyState} from "@/components/page/EmptyState";

export default function CompanyDetailsPage() {
    const { id } = useParams<{ id: string }>();
    const router = useRouter();

    // --- Состояние ---
    const [company, setCompany] = useState<Company | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // Модальные окна
    const [isEditOpen, setEditOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [isActionLoading, setActionLoading] = useState(false);
    const deleteTriggerRef = useRef<HTMLButtonElement>(null);

    // --- Загрузка данных ---
    const fetchCompanyData = useCallback(async () => {
        if (!id) return;

        setIsLoading(true);
        setError(null);

        try {
            const data = await companyService.getById(id);
            setCompany(data);
        } catch (err) {
            console.error(err);
            setError("Не удалось загрузить информацию о компании");
        } finally {
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
            fetchCompanyData();
    }, [fetchCompanyData]);

    // --- Хендлеры действий ---

    const handleUpdate = async (payload: CompanyPayload) => {
        if (!company || isActionLoading) return false;

        const actionFeedback = feedback.beginAction("companyUpdate");
        setActionLoading(true);
        try {
            await companyService.update(company.id, payload);
            actionFeedback.success();
            await fetchCompanyData(); // Обновляем данные на странице
            return true;
        } catch (err) {
            actionFeedback.error(err);
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!company || isActionLoading) return;

        const actionFeedback = feedback.beginAction("companyDelete");
        setActionLoading(true);
        try {
            await companyService.delete(company.id);
            actionFeedback.success();
            setDeleteOpen(false);
            router.push("/company"); // Редирект к списку
        } catch (err) {
            actionFeedback.error(err);
        } finally {
            setActionLoading(false);
        }
    };

    // --- Обработка состояний загрузки страницы ---

    if (isLoading) {
        return (
            <Center minH="calc(100dvh - 64px)">
                <Spinner size="xl" color="accent" />
            </Center>
        );
    }

    if (error || !company) {
        return (
            <Container maxW="4xl" px={{base: 4, md: 6}} py={{base: 6, md: 8}}>
                <Button
                    variant="subtle"
                    onClick={() => router.back()}
                    mb={4}
                >
                    <ArrowLeft style={{ width: "16px", marginRight: "8px" }} /> Назад
                </Button>
                <Stack gap={6}>
                    <PageHeader title="Компания" />
                    <EmptyState
                        title="Компания недоступна"
                        description={error || "Компания не найдена"}
                    />
                </Stack>
            </Container>
        );
    }

    return (
        <Container maxW="4xl" px={{base: 4, md: 6}} py={{base: 6, md: 8}}>
            {/* Навигация */}
            <Button
                variant="subtle"
                onClick={() => router.push("/company")}
                mb={6}
                size="sm"
            >
                <ArrowLeft style={{ width: "16px", marginRight: "8px" }} />
                К списку компаний
            </Button>

            {/* Заголовок и основные действия */}
            <PageHeader
                title={company.title}
                description="Настройки рабочей точки"
                actions={<Stack direction={{base: "column", sm: "row"}} gap={3}>
                    <Button
                        variant="outline"
                        onClick={() => setEditOpen(true)}
                    >
                        <Edit style={{ width: "16px", marginRight: "8px" }} />
                        Изменить
                    </Button>
                    <Button
                        ref={deleteTriggerRef}
                        colorPalette="danger"
                        variant="solid"
                        onClick={() => setDeleteOpen(true)}
                    >
                        <Trash2 style={{ width: "16px", marginRight: "8px" }} />
                        Удалить
                    </Button>
                </Stack>}
            />

            {/* Карточка с деталями */}
            <Card.Root mt={6} variant="outline">
                <Card.Body p={{base: 5, md: 6}}>
                    <Stack gap={6} separator={<Separator />}>

                        {/* ID (обычно полезно для админов) */}
                        <Box>
                            <Text textStyle="sm" color="fg.muted" mb={1}>ID Компании</Text>
                            <Text fontFamily="mono" overflowWrap="anywhere">{company.id}</Text>
                        </Box>

                        {/* Название */}
                        <Box>
                            <Text textStyle="sm" color="fg.muted" mb={1}>Название</Text>
                            <Text fontWeight="medium" fontSize="lg">{company.title}</Text>
                        </Box>

                        {/* Коэффициент */}
                        <Box>
                            <Text textStyle="sm" color="fg.muted" mb={1}>
                                Коэффициент ЗП от выручки
                            </Text>
                            <Text fontWeight="medium" fontSize="lg">
                                {/* Конвертация 350 -> 3.5% */}
                                {(company.employeeWageCoefficientFromRevenue / 100).toFixed(2)}%
                            </Text>
                        </Box>

                        {/* Время смены */}
                        <Box>
                            <Text textStyle="sm" color="fg.muted" mb={1}>
                                Начало смены по умолчанию
                            </Text>
                            <Text fontWeight="medium" fontSize="lg">
                                {company.defaultShiftStartTime}
                            </Text>
                        </Box>
                    </Stack>
                </Card.Body>
            </Card.Root>

            {/* Модальные окна */}
            <CompanyFormModal
                isOpen={isEditOpen}
                onClose={() => setEditOpen(false)}
                onSubmit={handleUpdate}
                initialData={company}
                isLoading={isActionLoading}
            />

            <ConfirmationDialog
                open={isDeleteOpen}
                title="Удалить компанию?"
                description={`Компания «${company.title}» будет удалена без возможности восстановления.`}
                confirmLabel="Удалить"
                cancelLabel="Отмена"
                pendingLabel={feedbackMessages.companyDelete.loading}
                severity="danger"
                pending={isActionLoading}
                finalFocusEl={() => deleteTriggerRef.current}
                onCancel={() => {
                    if (!isActionLoading) {
                        setDeleteOpen(false);
                    }
                }}
                onConfirm={handleDelete}
            />
        </Container>
    );
}
