// @/app/results/_components/ResultsTable.tsx
"use client";

import {useRef, useState} from "react";
import {
    Badge,
    Box,
    Button,
    Flex,
    HStack,
    IconButton,
    Menu,
    Separator,
    Spinner,
    Stack,
    Table,
    Text,
    useMediaQuery,
} from "@chakra-ui/react";
import {ChevronDown, ChevronRight, FileText, Pencil, Trash2} from "lucide-react";
import {HiDotsVertical} from "react-icons/hi";
import {useRouter} from "next/navigation";
import {ShiftResultDetailed} from "@/types/shiftResult.types";

interface ResultsTableProps {
    data: ShiftResultDetailed[];
    isLoading: boolean;
    onEdit: (data: ShiftResultDetailed, trigger: HTMLButtonElement | null) => void;
    onDelete: (id: string, trigger: HTMLButtonElement | null) => void;
}

function formatDate(date: Date) {
    return new Date(date).toLocaleDateString("ru-RU");
}

function formatMoney(value: number) {
    return value.toLocaleString("ru-RU", {
        style: "currency",
        currency: "RUB",
        maximumFractionDigits: 0,
    });
}

function employeeName(payment: ShiftResultDetailed["payments"][number]) {
    return payment.employee.simpleName ||
        `${payment.employee.lastName} ${payment.employee.firstName}`;
}

function resultTotal(result: ShiftResultDetailed) {
    return result.payments.reduce(
        (sum, payment) => sum + payment.percentFromRevenue + payment.tips,
        0,
    );
}

function employeeCountLabel(count: number) {
    const lastTwoDigits = count % 100;
    const lastDigit = count % 10;

    if (lastTwoDigits >= 11 && lastTwoDigits <= 14) return `${count} сотрудников`;
    if (lastDigit === 1) return `${count} сотрудник`;
    if (lastDigit >= 2 && lastDigit <= 4) return `${count} сотрудника`;
    return `${count} сотрудников`;
}

export function ResultsTable({data, isLoading, onEdit, onDelete}: ResultsTableProps) {
    const router = useRouter();
    const [expandedResultId, setExpandedResultId] = useState<string | null>(null);
    const actionTriggers = useRef(new Map<string, HTMLButtonElement>());
    const [isMobile] = useMediaQuery(["(max-width: 47.997rem)"], {fallback: [false]});

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
                <Spinner size="xl" color="accent"/>
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
        <Box role="region" aria-label="Таблица результатов смен" tabIndex={0}>
            {!isMobile && (
                <Box
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
                                    <Table.Cell>{formatDate(result.date)}</Table.Cell>
                                    <Table.Cell>
                                        <Flex direction="column" gap={1}>
                                            {result.payments.map((payment) => (
                                                <HStack key={payment.id} fontSize="sm" justify="space-between" gap={4}>
                                                    <Text fontWeight="medium">{employeeName(payment)}:</Text>
                                                    <Badge
                                                        variant="outline"
                                                        bg="bg.raised"
                                                        color="fg"
                                                        borderColor="border.emphasized"
                                                        fontVariantNumeric="tabular-nums"
                                                        whiteSpace="nowrap"
                                                    >
                                                        {formatMoney(payment.percentFromRevenue + payment.tips)}
                                                    </Badge>
                                                </HStack>
                                            ))}
                                        </Flex>
                                    </Table.Cell>
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
                                                    aria-label={`Действия для смены ${formatDate(result.date)}`}
                                                >
                                                    <HiDotsVertical/>
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
            )}

            {isMobile && (
                <Stack gap={3}>
                    {data.map((result) => {
                        const expanded = expandedResultId === result.id;
                        const total = resultTotal(result);

                        return (
                        <Box
                            key={result.id}
                            borderWidth="1px"
                            borderColor={expanded ? "accent.border" : "border"}
                            borderRadius="panel"
                            bg="bg.panel"
                            boxShadow="panel"
                            overflow="hidden"
                        >
                            <Box
                                as="button"
                                width="full"
                                textAlign="start"
                                p={4}
                                onClick={() => setExpandedResultId((current) => current === result.id ? null : result.id)}
                                aria-expanded={expanded}
                                aria-controls={`mobile-result-${result.id}`}
                                aria-label={`Смена ${formatDate(result.date)}, ${employeeCountLabel(result.payments.length)}, ${formatMoney(total)}`}
                                _hover={{bg: "accent.subtle"}}
                                _focusVisible={{
                                    outline: "2px solid",
                                    outlineColor: "focus.ring",
                                    outlineOffset: "-2px",
                                }}
                            >
                                <Flex justify="space-between" align="center" gap={3}>
                                    <Stack gap={1} minW={0}>
                                        <Text fontWeight="bold">{formatDate(result.date)}</Text>
                                        <Text color="fg.muted" fontSize="sm">
                                            {employeeCountLabel(result.payments.length)}
                                        </Text>
                                    </Stack>
                                    <HStack gap={2} flexShrink={0}>
                                        <Text fontWeight="bold" fontVariantNumeric="tabular-nums">
                                            {formatMoney(total)}
                                        </Text>
                                        {expanded ? <ChevronDown size={18}/> : <ChevronRight size={18}/>}
                                    </HStack>
                                </Flex>

                                {!expanded && (
                                    <Flex mt={3} gap={2} wrap="wrap">
                                        {result.payments.slice(0, 2).map((payment) => (
                                            <Badge key={payment.id} variant="outline" bg="bg.raised" color="fg">
                                                {employeeName(payment).split(" ")[0]} · {formatMoney(payment.percentFromRevenue + payment.tips)}
                                            </Badge>
                                        ))}
                                        {result.payments.length > 2 && (
                                            <Badge variant="subtle">+{result.payments.length - 2}</Badge>
                                        )}
                                    </Flex>
                                )}
                            </Box>

                            {expanded && (
                                <Box id={`mobile-result-${result.id}`} px={4} pb={4}>
                                    <Separator mb={3}/>
                                    <Stack gap={2} mb={4}>
                                        {result.payments.map((payment) => (
                                            <Flex key={payment.id} justify="space-between" align="baseline" gap={3}>
                                                <Text fontSize="sm" minW={0}>{employeeName(payment)}</Text>
                                                <Text
                                                    fontSize="sm"
                                                    fontWeight="semibold"
                                                    whiteSpace="nowrap"
                                                    fontVariantNumeric="tabular-nums"
                                                >
                                                    {formatMoney(payment.percentFromRevenue + payment.tips)}
                                                </Text>
                                            </Flex>
                                        ))}
                                    </Stack>

                                    <Stack gap={2}>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => router.push(`/results/${result.id}`)}
                                        >
                                            <FileText size={16}/>
                                            Подробнее
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={(event) => onEdit(result, event.currentTarget)}
                                        >
                                            <Pencil size={16}/>
                                            Изменить
                                        </Button>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            colorPalette="danger"
                                            onClick={(event) => onDelete(result.id, event.currentTarget)}
                                        >
                                            <Trash2 size={16}/>
                                            Удалить
                                        </Button>
                                    </Stack>
                                </Box>
                            )}
                        </Box>
                        );
                    })}
                </Stack>
            )}
        </Box>
    );
}
