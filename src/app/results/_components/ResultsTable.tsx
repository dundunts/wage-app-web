// @/app/results/_components/ResultsTable.tsx
"use client";

import {
    Table,
    Box,
    IconButton,
    Menu,
    Text,
    Badge,
    HStack,
    Spinner, Flex
} from "@chakra-ui/react";
import { HiDotsVertical } from "react-icons/hi";
import { ShiftResultDetailed } from "@/types/shiftResult.types";
import { useRouter } from "next/navigation";

interface ResultsTableProps {
    data: ShiftResultDetailed[];
    isLoading: boolean;
    onEdit: (data: ShiftResultDetailed) => void;
    onDelete: (id: string) => void;
}

export function ResultsTable({ data, isLoading, onEdit, onDelete }: ResultsTableProps) {
    const router = useRouter();

    if (isLoading) {
        return <Flex justify="center" p={10}><Spinner size="xl" /></Flex>;
    }

    if (data.length === 0) {
        return <Box p={4} textAlign="center">Результаты не найдены</Box>;
    }

    return (
        <Box borderWidth="1px" borderRadius="lg" overflow="hidden">
            <Table.Root interactive>
                <Table.Header>
                    <Table.Row>
                        <Table.ColumnHeader>Дата</Table.ColumnHeader>
                        <Table.ColumnHeader>Выплаты (Работник - Всего)</Table.ColumnHeader>
                        <Table.ColumnHeader textAlign="end">Действия</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map((result) => (
                        <Table.Row key={result.id}>
                            {/* Дата */}
                            <Table.Cell>
                                {new Date(result.date).toLocaleDateString("ru-RU")}
                            </Table.Cell>

                            {/* Выплаты */}
                            <Table.Cell>
                                <Flex direction="column" gap={1}>
                                    {result.payments.map((payment) => {
                                        const total = payment.percentFromRevenue + payment.tips;
                                        const name = payment.employee.simpleName ||
                                            `${payment.employee.lastName} ${payment.employee.firstName}`;

                                        return (
                                            <HStack key={payment.id} fontSize="sm">
                                                <Text fontWeight="medium">{name}:</Text>
                                                <Badge colorPalette="green" variant="subtle">
                                                    {total.toLocaleString("ru-RU", { style: 'currency', currency: 'RUB' })}
                                                </Badge>
                                            </HStack>
                                        );
                                    })}
                                </Flex>
                            </Table.Cell>

                            {/* Действия */}
                            <Table.Cell textAlign="end">
                                <Menu.Root>
                                    <Menu.Trigger asChild>
                                        <IconButton variant="ghost" size="sm" aria-label="Опции">
                                            <HiDotsVertical />
                                        </IconButton>
                                    </Menu.Trigger>
                                    <Menu.Positioner>
                                        <Menu.Content>
                                            <Menu.Item value="details" onClick={() => router.push(`/results/${result.id}`)}>
                                                Подробнее
                                            </Menu.Item>
                                            <Menu.Item value="edit" onClick={() => onEdit(result)}>
                                                Изменить
                                            </Menu.Item>
                                            <Menu.Item value="delete" color="fg.error" onClick={() => onDelete(result.id)}>
                                                Удалить
                                            </Menu.Item>
                                        </Menu.Content>
                                    </Menu.Positioner>
                                </Menu.Root>
                            </Table.Cell>
                        </Table.Row>
                    ))}
                </Table.Body>
            </Table.Root>
        </Box>
    );
}