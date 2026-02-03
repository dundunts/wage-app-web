// @/components/company/company-list.tsx
"use client";

import { useState } from "react";
import { useSearchParams, usePathname, useRouter } from "next/navigation";
import Link from "next/link";
import {
    Box,
    Button,
    Heading,
    HStack,
    IconButton,
    Table,
    Menu,
    Text,
    Flex,
    Spacer,
    Spinner,
    Center
} from "@chakra-ui/react";
import {
    MoreHorizontal,
    Trash2,
    Eye,
    Plus,
    ChevronLeft,
    ChevronRight
} from "lucide-react";

import { Company, CompanyPayload } from "@/types/company.types";
import { createCompany, deleteCompany } from "@/service/company/company.service";
import { CompanyFormModal } from "./company-form-modal";
import {Page} from "@/types/common.types";
import {DeleteConfirmModal} from "@/components/dialog/delete-confirm-modal";

interface CompanyListProps {
    data: Page<Company> | null;
    isLoadingData: boolean;
    onRefresh: () => void; // Коллбэк для обновления данных
}

export const CompanyList = ({ data, isLoadingData, onRefresh }: CompanyListProps) => {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();

    // Локальное состояние для UI действий
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [companyToDelete, setCompanyToDelete] = useState<Company | null>(null);
    const [isActionLoading, setActionLoading] = useState(false); // Для спиннеров на кнопках

    // --- Хендлеры действий ---

    const handleCreate = async (payload: CompanyPayload) => {
        setActionLoading(true);
        try {
            await createCompany(payload);
            onRefresh(); // Обновляем таблицу
        } catch (error) {
            console.error(error);
            alert("Ошибка при создании компании");
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!companyToDelete) return;
        setActionLoading(true);
        try {
            await deleteCompany(companyToDelete.id);
            onRefresh(); // Обновляем таблицу
            setCompanyToDelete(null);
        } catch (error) {
            console.error(error);
            alert("Ошибка при удалении компании");
        } finally {
            setActionLoading(false);
        }
    };

    const handlePageChange = (newPage: number) => {
        const params = new URLSearchParams(searchParams.toString());
        params.set("page", newPage.toString());
        router.push(`${pathname}?${params.toString()}`);
        // useEffect в родительском компоненте отловит изменение URL и обновит данные
    };

    // --- Рендер ---

    if (!data && isLoadingData) {
        return (
            <Center h="300px">
                <Spinner size="xl" color="blue.500" />
            </Center>
        );
    }

    // Если данные не загрузились и нет загрузки (ошибка)
    if (!data) {
        return <Box p={6}>Не удалось загрузить данные</Box>;
    }

    const { content: companies, number: currentPage, totalPages } = data;
    const hasNext = currentPage < totalPages - 1;
    const hasPrev = currentPage > 0;

    return (
        <Box p={6}>
            <Flex mb={6} align="center">
                <Heading size="2xl">Компании</Heading>
                <Spacer />
                <Button onClick={() => setCreateOpen(true)} colorPalette="blue">
                    <Plus /> Создать компанию
                </Button>
            </Flex>

            <Box borderWidth="1px" borderRadius="lg" overflow="hidden" position="relative">
                {/* Оверлей загрузки при пагинации/обновлении */}
                {isLoadingData && (
                    <Box
                        position="absolute"
                        inset="0"
                        bg="white/50"
                        zIndex="1"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Spinner color="blue.500" />
                    </Box>
                )}

                <Table.Root interactive>
                    <Table.Header>
                        <Table.Row>
                            <Table.ColumnHeader>Название</Table.ColumnHeader>
                            <Table.ColumnHeader textAlign="end">Действия</Table.ColumnHeader>
                        </Table.Row>
                    </Table.Header>
                    <Table.Body>
                        {companies.length === 0 ? (
                            <Table.Row>
                                <Table.Cell colSpan={2} textAlign="center" py={8}>
                                    <Text color="fg.muted">Компании не найдены</Text>
                                </Table.Cell>
                            </Table.Row>
                        ) : (
                            companies.map((company) => (
                                <Table.Row key={company.id}>
                                    <Table.Cell fontWeight="medium">{company.title}</Table.Cell>
                                    <Table.Cell textAlign="end">
                                        <Menu.Root positioning={{ placement: "bottom-end" }}>
                                            <Menu.Trigger asChild>
                                                <IconButton variant="ghost" size="sm" aria-label="Опции">
                                                    <MoreHorizontal />
                                                </IconButton>
                                            </Menu.Trigger>
                                            <Menu.Content>
                                                <Menu.Item value="details" asChild>
                                                    <Link href={`/company/${company.id}`}>
                                                        <Eye style={{ marginRight: "8px", width: "16px" }} />
                                                        Подробнее
                                                    </Link>
                                                </Menu.Item>
                                                <Menu.Item
                                                    value="delete"
                                                    color="fg.error"
                                                    onClick={() => setCompanyToDelete(company)}
                                                >
                                                    <Trash2 style={{ marginRight: "8px", width: "16px" }} />
                                                    Удалить
                                                </Menu.Item>
                                            </Menu.Content>
                                        </Menu.Root>
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        )}
                    </Table.Body>
                </Table.Root>

                {totalPages > 1 && (
                    <Flex p={4} justify="flex-end" align="center" gap={4} borderTopWidth="1px">
                        <Text textStyle="sm" color="fg.muted">
                            Страница {currentPage + 1} из {totalPages}
                        </Text>
                        <HStack>
                            <IconButton
                                variant="outline"
                                disabled={!hasPrev || isLoadingData}
                                onClick={() => handlePageChange(currentPage - 1)}
                                aria-label="Предыдущая страница"
                            >
                                <ChevronLeft />
                            </IconButton>
                            <IconButton
                                variant="outline"
                                disabled={!hasNext || isLoadingData}
                                onClick={() => handlePageChange(currentPage + 1)}
                                aria-label="Следующая страница"
                            >
                                <ChevronRight />
                            </IconButton>
                        </HStack>
                    </Flex>
                )}
            </Box>

            {/* Модальные окна */}
            <CompanyFormModal
                isOpen={isCreateOpen}
                onClose={() => setCreateOpen(false)}
                onSubmit={handleCreate}
                isLoading={isActionLoading}
            />

            <DeleteConfirmModal
                isOpen={!!companyToDelete}
                onClose={() => setCompanyToDelete(null)}
                onConfirm={handleDelete}
                title={`Удалить "${companyToDelete?.title}"?`}
                isLoading={isActionLoading}
            />
        </Box>
    );
};