import {Box, Button, Card, Flex, HStack, Stack, Text, VStack} from "@chakra-ui/react";
import {Pencil, Trash} from "lucide-react";
import React from "react";
import {Checkpoint} from "@/types/checkpoint.types";
import {formatEmployeeName} from "@/utils/employee.utils";

type ShiftCheckpointCardProps = {
    checkpoint: Checkpoint,
    position: number,
    onDeleteRequested: () => void,
    onEdit: () => void,
}

export function ShiftCheckpointCard(
    {
        checkpoint,
        position,
        onDeleteRequested,
        onEdit,
    }: ShiftCheckpointCardProps
) {
    return (
        <Card.Root
            variant="outline"
            bg="bg.panel"
            borderColor="border"
            overflow="hidden"
        >
            {/* Header */}
            <Card.Header pb={3} bg="bg.raised" borderBottomWidth="1px" borderColor="border.muted">
                <Flex align="center" justify="space-between">
                    <Text fontWeight="semibold">
                        Чекпоинт #{position}
                    </Text>
                    <Text fontSize="xs" color="fg.quiet" textTransform="uppercase" letterSpacing="wide">
                        {checkpoint.type === "FINAL" ? "Финальный" : "Обычный"}
                    </Text>
                </Flex>
            </Card.Header>

            {/* Body */}
            <Card.Body pt={2}>
                <Stack gap={3}>
                    {/* Employees */}
                    <VStack align="start" gap={1}>
                        <Text fontSize="sm" color="fg.muted">
                            Сотрудники
                        </Text>
                        <HStack wrap="wrap">
                            {checkpoint.employees.map((e) => (
                                <Box
                                    key={e.id}
                                    px={2}
                                    py={1}
                                    borderRadius="md"
                                    bg="bg.subtle"
                                    fontSize="sm"
                                >
                                    {formatEmployeeName(e)}
                                </Box>
                            ))}
                        </HStack>
                    </VStack>

                    {/* Revenue / Tips */}
                    <Flex gap={{base: 3, sm: 6}} direction={{base: "column", sm: "row"}}>
                        <VStack align="start" gap={0}>
                            <Text fontSize="sm" color="fg.muted">
                                Выручка
                            </Text>
                            <Text fontWeight="semibold" fontSize="xl" fontVariantNumeric="tabular-nums">
                                {checkpoint.revenue.toLocaleString()} ₽
                            </Text>
                        </VStack>

                        <VStack align="start" gap={0}>
                            <Text fontSize="sm" color="fg.muted">
                                Чаевые
                            </Text>
                            <Text fontWeight="semibold" fontSize="xl" fontVariantNumeric="tabular-nums">
                                {checkpoint.tips.toLocaleString()} ₽
                            </Text>
                        </VStack>
                    </Flex>

                    {/* Updated at */}
                    <Text fontSize="xs" color="fg.muted">
                        Дата и время:{" "}
                        {new Date(checkpoint.dateTime).toLocaleString()}
                    </Text>
                </Stack>
            </Card.Body>
            <Card.Footer gap={2} flexWrap="wrap" borderTopWidth="1px" borderColor="border.muted">
                <Button
                    aria-label={`Изменить чекпоинт ${position}`}
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                >
                    <Pencil size={16}/> Изменить
                </Button>

                <Button
                    aria-label={`Удалить чекпоинт ${position}`}
                    variant="outline"
                    size="sm"
                    color="status.danger"
                    borderColor="status.danger"
                    onClick={onDeleteRequested}
                >
                    <Trash size={16}/> Удалить
                </Button>
            </Card.Footer>
        </Card.Root>
    );
}
