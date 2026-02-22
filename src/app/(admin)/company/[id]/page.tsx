// @/app/(admin)/company/[id]/page.tsx
"use client";

import {useCallback, useEffect, useState} from "react";
import {useParams, useRouter} from "next/navigation";
import {Box, Button, Card, Center, Flex, Heading, HStack, Separator, Spinner, Stack, Text} from "@chakra-ui/react";
import {ArrowLeft, Edit, Trash2} from "lucide-react";

import {Company, CompanyPayload} from "@/types/company.types";
import {companyService} from "@/service/company/company.service";
import {CompanyFormModal} from "@/components/company/company-form-modal";
import {DeleteConfirmModal} from "@/components/dialog/delete-confirm-modal";

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
        if (!company) return;
        setActionLoading(true);
        try {
            await companyService.update(company.id, payload);
            await fetchCompanyData(); // Обновляем данные на странице
            setEditOpen(false);
        } catch (err) {
            console.error(err);
            alert("Ошибка при обновлении компании");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!company) return;
        setActionLoading(true);
        try {
            await companyService.delete(company.id);
            router.push("/company"); // Редирект к списку
        } catch (err) {
            console.error(err);
            alert("Ошибка при удалении компании");
        } finally {
            setActionLoading(false);
        }
    };

    // --- Обработка состояний загрузки страницы ---

    if (isLoading) {
        return (
            <Center h="100vh">
                <Spinner size="xl" color="blue.500" />
            </Center>
        );
    }

    if (error || !company) {
        return (
            <Box p={6}>
                <Button
                    variant="subtle"
                    onClick={() => router.back()}
                    mb={4}
                >
                    <ArrowLeft style={{ width: "16px", marginRight: "8px" }} /> Назад
                </Button>
                <Center h="200px">
                    <Text color="red.500" fontSize="lg">{error || "Компания не найдена"}</Text>
                </Center>
            </Box>
        );
    }

    return (
        <Box p={6} maxW="800px" mx="auto">
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
            <Flex justify="space-between" align="center" mb={6} wrap="wrap" gap={4}>
                <Heading size="2xl">{company.title}</Heading>
                <HStack>
                    <Button
                        variant="outline"
                        onClick={() => setEditOpen(true)}
                    >
                        <Edit style={{ width: "16px", marginRight: "8px" }} />
                        Изменить
                    </Button>
                    <Button
                        colorPalette="red"
                        variant="solid"
                        onClick={() => setDeleteOpen(true)}
                    >
                        <Trash2 style={{ width: "16px", marginRight: "8px" }} />
                        Удалить
                    </Button>
                </HStack>
            </Flex>

            {/* Карточка с деталями */}
            <Card.Root variant="elevated">
                <Card.Body>
                    <Stack gap={6} separator={<Separator />}>

                        {/* ID (обычно полезно для админов) */}
                        <Box>
                            <Text textStyle="sm" color="fg.muted" mb={1}>ID Компании</Text>
                            <Text fontFamily="mono">{company.id}</Text>
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

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
                title={`Удалить "${company.title}"?`}
                description="Вы уверены? Данные о компании будут безвозвратно удалены из системы."
                isLoading={isActionLoading}
            />
        </Box>
    );
}