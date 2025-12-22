import {Box, HStack, Stack, Table, Text} from "@chakra-ui/react";
import React from 'react';
import {EmployeePaymentDraft, ShiftResultsDraft} from "@/types/shift.results.draft.types";

type ShiftResultsDraftTableProps = {
    resultsDraft: ShiftResultsDraft;
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
                    <Table.ColumnHeader>Начало</Table.ColumnHeader>
                    <Table.ColumnHeader>Конец</Table.ColumnHeader>
                    <Table.ColumnHeader>Отработал</Table.ColumnHeader>
                </Table.Row>
            </Table.Header>

            <Table.Body>
                {resultsDraft.payments.map((p) => {
                    const total = p.percentFromRevenue + p.tips;
                    const workedMs =
                        new Date(p.endWorkAt).getTime() -
                        new Date(p.startWorkAt).getTime();

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
                                {new Date(p.startWorkAt).toLocaleTimeString()}
                            </Table.Cell>
                            <Table.Cell>
                                {new Date(p.endWorkAt).toLocaleTimeString()}
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
    payment: EmployeePaymentDraft
}

export function EmployeePaymentDraftCard({payment: p} : EmployeePaymentDraftCardProps) {
    const total = p.percentFromRevenue + p.tips;
    const workedMs =
        new Date(p.endWorkAt).getTime() -
        new Date(p.startWorkAt).getTime();

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
                    <Text>Смена</Text>
                    <Text>
                        {new Date(p.startWorkAt).toLocaleTimeString()} –{" "}
                        {new Date(p.endWorkAt).toLocaleTimeString()}
                    </Text>
                </HStack>
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