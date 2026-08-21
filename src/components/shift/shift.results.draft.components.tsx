import {Box, HStack, Stack, Table, Text} from "@chakra-ui/react";
import React from 'react';
import {PaymentDraft, ShiftResultDraft} from "@/types/draft.types";

type ShiftResultsDraftTableProps = {
    resultsDraft: ShiftResultDraft;
}

export function ShiftResultsDraftTable({resultsDraft} : ShiftResultsDraftTableProps) {
    return (
        <Table.Root size="sm" variant="line" bg="bg.panel">
            <Table.Header>
                <Table.Row bg="bg.raised">
                    <Table.ColumnHeader color="fg.muted">Сотрудник</Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted" textAlign="right">От выручки</Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted" textAlign="right">Из фонда чаевых</Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted" textAlign="right">Итого</Table.ColumnHeader>
                    <Table.ColumnHeader color="fg.muted">Отработал</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {resultsDraft.payments.map((p) => {
                    const total = p.percentFromRevenue + p.tips;
                    const workedMs = p.workSeconds * 1000

                    const workedHours = Math.floor(workedMs / 36e5);
                    const workedMinutes = Math.floor((workedMs % 36e5) / 6e4);

                    return (
                        <Table.Row key={p.employee.id} _hover={{bg: "accent.subtle"}}>
                            <Table.Cell>
                                {p.employee.lastName}{" "}
                                {p.employee.firstName[0]}.{" "}
                                {p.employee.patronymic?.[0] && `${p.employee.patronymic[0]}.`}
                            </Table.Cell>
                            <Table.Cell textAlign="right" fontVariantNumeric="tabular-nums">
                                {p.percentFromRevenue.toLocaleString()} ₽
                            </Table.Cell>
                            <Table.Cell textAlign="right" fontVariantNumeric="tabular-nums">
                                {p.tips.toLocaleString()} ₽
                            </Table.Cell>
                            <Table.Cell textAlign="right" fontWeight="semibold" fontVariantNumeric="tabular-nums">
                                {total.toLocaleString()} ₽
                            </Table.Cell>
                            <Table.Cell fontVariantNumeric="tabular-nums">
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
            borderColor="border"
            borderRadius="panel"
            bg="bg.panel"
            p={4}
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
                    <Text color="fg.muted">От выручки</Text>
                    <Text fontVariantNumeric="tabular-nums">{p.percentFromRevenue.toLocaleString()} ₽</Text>
                </HStack>
                <HStack justify="space-between" fontSize="sm">
                    <Text color="fg.muted">Из фонда чаевых</Text>
                    <Text fontVariantNumeric="tabular-nums">{p.tips.toLocaleString()} ₽</Text>
                </HStack>
                <HStack justify="space-between" fontWeight="semibold" bg="bg.subtle" borderRadius="control" px={3} py={2}>
                    <Text>Итого</Text>
                    <Text fontVariantNumeric="tabular-nums">{total.toLocaleString()} ₽</Text>
                </HStack>

                {/*<Divider />*/}

                {/* Time row */}
                <HStack justify="space-between" fontSize="sm">
                    <Text color="fg.muted">Отработал</Text>
                    <Text fontVariantNumeric="tabular-nums">
                        {workedHours}ч {workedMinutes}м
                    </Text>
                </HStack>
            </Stack>
        </Box>
    );
}
