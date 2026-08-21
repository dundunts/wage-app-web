// @/components/company/company-list.tsx
"use client";

import {useState} from "react";
import {usePathname, useRouter, useSearchParams} from "next/navigation";
import Link from "next/link";
import {
    Box,
    Button,
    Center,
    Container,
    Flex,
    HStack,
    IconButton,
    Menu,
    Portal,
    Spinner,
    Table,
    Text
} from "@chakra-ui/react";
import {ChevronLeft, ChevronRight, Eye, MoreHorizontal, Plus, Trash2} from "lucide-react";

import {Company, CompanyPayload} from "@/types/company.types";
import {companyService} from "@/service/company/company.service";
import {CompanyFormModal} from "./company-form-modal";
import {Page} from "@/types/common.types";
import {ConfirmationDialog} from "@/components/dialog/ConfirmationDialog";
import {feedback} from "@/feedback/feedback";
import {feedbackMessages} from "@/feedback/messages";
import {PageHeader} from "@/components/page/PageHeader";

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
        if (isActionLoading) return false;

        const actionFeedback = feedback.beginAction("companyCreate");
        setActionLoading(true);
        try {
            await companyService.create(payload);
            actionFeedback.success();
            onRefresh(); // Обновляем таблицу
            return true;
        } catch (error) {
            actionFeedback.error(error);
            return false;
        } finally {
            setActionLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!companyToDelete || isActionLoading) return;

        const actionFeedback = feedback.beginAction("companyDelete");
        setActionLoading(true);
        try {
            await companyService.delete(companyToDelete.id);
            actionFeedback.success();
            onRefresh(); // Обновляем таблицу
            setCompanyToDelete(null);
        } catch (error) {
            actionFeedback.error(error);
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
            <Center role="status" aria-label="Company загружаются" h="300px">
                <Spinner size="xl" color="accent" />
            </Center>
        );
    }

    // Если данные не загрузились и нет загрузки (ошибка)
    if (!data) {
        return (
            <Container maxW="7xl" px={{base: 4, md: 6}} py={{base: 6, md: 8}}>
                <Text color="status.danger">Не удалось загрузить данные</Text>
            </Container>
        );
    }

    const { content: companies, number: currentPage, totalPages } = data;
    const hasNext = currentPage < totalPages - 1;
    const hasPrev = currentPage > 0;

    return (
        <Container maxW="7xl" px={{base: 4, md: 6}} py={{base: 6, md: 8}}>
            <PageHeader
                title="Компании"
                actions={<Button
                    onClick={() => setCreateOpen(true)}
                    colorPalette="brand"
                    w={{base: "full", md: "auto"}}
                >
                    <Plus /> Создать компанию
                </Button>}
            />

            <Box
                mt={6}
                layerStyle="panel"
                overflowX="auto"
                position="relative"
            >
                {/* Оверлей загрузки при пагинации/обновлении */}
                {isLoadingData && (
                    <Box
                        role="status"
                        aria-label="Company обновляются"
                        position="absolute"
                        inset="0"
                        bg="bg.panel/82"
                        zIndex="1"
                        display="flex"
                        alignItems="center"
                        justifyContent="center"
                    >
                        <Spinner color="accent" />
                    </Box>
                )}

                <Table.Root interactive size="sm" variant="line" minW="36rem">
                    <Table.Header bg="bg.subtle">
                        <Table.Row>
                            <Table.ColumnHeader color="fg.muted">Название</Table.ColumnHeader>
                            <Table.ColumnHeader color="fg.muted" textAlign="end">Действия</Table.ColumnHeader>
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
                                <Table.Row
                                    key={company.id}
                                    borderColor="border.muted"
                                    _hover={{bg: "accent.subtle"}}
                                >
                                    <Table.Cell fontWeight="medium">{company.title}</Table.Cell>
                                    <Table.Cell textAlign="end">
                                        <Menu.Root positioning={{ placement: "bottom-end" }}>
                                            <Menu.Trigger asChild>
                                                <IconButton
                                                    variant="subtle"
                                                    size="sm"
                                                    aria-label={`Опции компании «${company.title}»`}
                                                >
                                                    <MoreHorizontal />
                                                </IconButton>
                                            </Menu.Trigger>
                                            <Portal>
                                                <Menu.Positioner>
                                                    <Menu.Content
                                                        layerStyle="panel"
                                                        bg="bg.raised"
                                                        borderRadius="control"
                                                    >
                                                        <Menu.Item value="details" asChild>
                                                            <Link href={`/company/${company.id}`}>
                                                                <Eye style={{ marginRight: "8px", width: "16px" }} />
                                                                Подробнее
                                                            </Link>
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            value="delete"
                                                            color="status.danger"
                                                            onClick={() => setCompanyToDelete(company)}
                                                        >
                                                            <Trash2 style={{ marginRight: "8px", width: "16px" }} />
                                                            Удалить
                                                        </Menu.Item>
                                                    </Menu.Content>
                                                </Menu.Positioner>
                                            </Portal>
                                        </Menu.Root>
                                    </Table.Cell>
                                </Table.Row>
                            ))
                        )}
                    </Table.Body>
                </Table.Root>

                {totalPages > 1 && (
                    <Flex
                        p={4}
                        justify="flex-end"
                        align="center"
                        gap={4}
                        borderTopWidth="1px"
                        borderColor="border"
                    >
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

            <ConfirmationDialog
                open={companyToDelete !== null}
                title="Удалить компанию?"
                description={`Компания «${companyToDelete?.title ?? ""}» будет удалена без возможности восстановления.`}
                confirmLabel="Удалить"
                cancelLabel="Отмена"
                pendingLabel={feedbackMessages.companyDelete.loading}
                severity="danger"
                pending={isActionLoading}
                onCancel={() => {
                    if (!isActionLoading) {
                        setCompanyToDelete(null);
                    }
                }}
                onConfirm={handleDelete}
            />
        </Container>
    );
};
