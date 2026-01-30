import {Box, HStack, Stack, Table, Text} from "@chakra-ui/react";
import React from 'react';
import {PaymentDraft, ShiftResultDraft} from "@/types/draft.types";

type ShiftResultsDraftTableProps = {
    resultsDraft: ShiftResultDraft;
}

export function ShiftResultsDraftTable({resultsDraft} : ShiftResultsDraftTableProps) {
    return (
        <Table.Root size="sm" striped>
            <Table.Header>
                <Table.Row>
                    <Table.ColumnHeader>Сотрудник</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">%</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Чаевые</Table.ColumnHeader>
                    <Table.ColumnHeader textAlign="right">Итого</Table.ColumnHeader>
                    <Table.ColumnHeader>Отработал</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {resultsDraft.payments.map((p) => {
                    const total = p.percentFromRevenue + p.tips;
                    const workedMs = p.workSeconds * 1000

                    const workedHours = Math.floor(workedMs / 36e5);
                    const workedMinutes = Math.floor((workedMs % 36e5) / 6e4);

                    return (
                        <Table.Row key={p.employee.id}>
                            <Table.Cell>
                                {p.employee.lastName}{" "}
                                {p.employee.firstName[0]}.{" "}
                                {p.employee.patronymic?.[0] && `${p.employee.patronymic[0]}.`}
                            </Table.Cell>
                            <Table.Cell textAlign="right">
                                {p.percentFromRevenue.toLocaleString()} ₽
                            </Table.Cell>
                            <Table.Cell textAlign="right">
                                {p.tips.toLocaleString()} ₽
                            </Table.Cell>
                            <Table.Cell textAlign="right" fontWeight="medium">
                                {total.toLocaleString()} ₽
                            </Table.Cell>
                            <Table.Cell>
                                {workedHours}ч {workedMinutes}м
                            </Table.Cell>
                        </Table.Row>
                    );
                })}
            </Table.Body>
        </Table.Root>
    );
}

type EmployeePaymentDraftCardProps = {
    payment: PaymentDraft
}

export function EmployeePaymentDraftCard({payment: p} : EmployeePaymentDraftCardProps) {
    const total = p.percentFromRevenue + p.tips;
    const workedMs = p.workSeconds * 1000;

    const workedHours = Math.floor(workedMs / 36e5);
    const workedMinutes = Math.floor((workedMs % 36e5) / 6e4);

    return (
        <Box
            key={p.employee.id}
            borderWidth="1px"
            borderRadius="lg"
            p={3}
        >
            <Stack gap={2}>
                {/* Header */}
                <Text fontWeight="semibold">
                    {p.employee.lastName}{" "}
                    {p.employee.firstName[0]}.{" "}
                    {p.employee.patronymic?.[0] && `${p.employee.patronymic[0]}.`}
                </Text>

                {/* Money row */}
                <HStack justify="space-between" fontSize="sm">
                    <Text>Процент</Text>
                    <Text>{p.percentFromRevenue.toLocaleString()} ₽</Text>
                </HStack>
                <HStack justify="space-between" fontSize="sm">
                    <Text>Чаевые</Text>
                    <Text>{p.tips.toLocaleString()} ₽</Text>
                </HStack>
                <HStack justify="space-between" fontWeight="medium">
                    <Text>Итого</Text>
                    <Text>{total.toLocaleString()} ₽</Text>
                </HStack>

                {/*<Divider />*/}

                {/* Time row */}
                <HStack justify="space-between" fontSize="sm">
                    <Text>Отработал</Text>
                    <Text>
                        {workedHours}ч {workedMinutes}м
                    </Text>
                </HStack>
            </Stack>
        </Box>
    );
}