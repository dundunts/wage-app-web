// @/app/results/_components/ResultsTable.tsx
"use client";

import {useRef} from "react";
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
    onEdit: (data: ShiftResultDetailed, trigger: HTMLButtonElement | null) => void;
    onDelete: (id: string, trigger: HTMLButtonElement | null) => void;
}

export function ResultsTable({ data, isLoading, onEdit, onDelete }: ResultsTableProps) {
    const router = useRouter();
    const actionTriggers = useRef(new Map<string, HTMLButtonElement>());

    if (isLoading) {
        return (
            <Flex
                role="status"
                aria-label="Результаты смен загружаются"
                justify="center"
                p={10}
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border"
                borderRadius="panel"
            >
                <Spinner size="xl" color="accent" />
            </Flex>
        );
    }

    if (data.length === 0) {
        return (
            <Box
                role="status"
                p={6}
                textAlign="center"
                color="fg.muted"
                bg="bg.panel"
                borderWidth="1px"
                borderColor="border"
                borderRadius="panel"
            >
                Результаты не найдены
            </Box>
        );
    }

    return (
        <Box
            role="region"
            aria-label="Таблица результатов смен"
            tabIndex={0}
            borderWidth="1px"
            borderColor="border"
            borderRadius="panel"
            overflowX="auto"
            bg="bg.panel"
            boxShadow="panel"
            focusRing="outside"
            focusRingColor="focus.ring"
        >
            <Table.Root interactive size="sm" minW="44rem">
                <Table.Header>
                    <Table.Row bg="bg.subtle">
                        <Table.ColumnHeader color="fg.muted">Дата</Table.ColumnHeader>
                        <Table.ColumnHeader color="fg.muted">Выплаты (сотрудник — итого)</Table.ColumnHeader>
                        <Table.ColumnHeader color="fg.muted" textAlign="end">Действия</Table.ColumnHeader>
                    </Table.Row>
                </Table.Header>
                <Table.Body>
                    {data.map((result) => (
                        <Table.Row key={result.id} _hover={{bg: "accent.subtle"}}>
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
                                            <HStack key={payment.id} fontSize="sm" justify="space-between" gap={4}>
                                                <Text fontWeight="medium">{name}:</Text>
                                                <Badge
                                                    variant="outline"
                                                    bg="bg.raised"
                                                    color="fg"
                                                    borderColor="border.emphasized"
                                                    fontVariantNumeric="tabular-nums"
                                                    whiteSpace="nowrap"
                                                >
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
                                        <IconButton
                                            ref={(element) => {
                                                if (element) {
                                                    actionTriggers.current.set(result.id, element);
                                                } else {
                                                    actionTriggers.current.delete(result.id);
                                                }
                                            }}
                                            variant="subtle"
                                            size="sm"
                                            aria-label={`Действия для смены ${new Date(result.date).toLocaleDateString("ru-RU")}`}
                                        >
                                            <HiDotsVertical />
                                        </IconButton>
                                    </Menu.Trigger>
                                    <Menu.Positioner>
                                        <Menu.Content>
                                            <Menu.Item value="details" onClick={() => router.push(`/results/${result.id}`)}>
                                                Подробнее
                                            </Menu.Item>
                                            <Menu.Item
                                                value="edit"
                                                onClick={() => onEdit(
                                                    result,
                                                    actionTriggers.current.get(result.id) ?? null,
                                                )}
                                            >
                                                Изменить
                                            </Menu.Item>
                                            <Menu.Item
                                                value="delete"
                                                color="fg.error"
                                                onClick={() => onDelete(
                                                    result.id,
                                                    actionTriggers.current.get(result.id) ?? null,
                                                )}
                                            >
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
