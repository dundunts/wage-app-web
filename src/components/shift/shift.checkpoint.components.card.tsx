import {Box, Button, Card, Flex, HStack, Stack, Text, VStack} from "@chakra-ui/react";
import {Pencil, Trash} from "lucide-react";
import React from "react";
import {Checkpoint} from "@/types/checkpoint.types";

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
        <Card.Root variant="outline">
            {/* Header */}
            <Card.Header pb={2}>
                <Flex align="center" justify="space-between">
                    <Text fontWeight="semibold">
                        Чекпоинт #{position}
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
                                    {e.simpleName}
                                </Box>
                            ))}
                        </HStack>
                    </VStack>

                    {/* Revenue / Tips */}
                    <HStack gap={6}>
                        <VStack align="start" gap={0}>
                            <Text fontSize="sm" color="fg.muted">
                                Выручка
                            </Text>
                            <Text fontWeight="medium">
                                {checkpoint.revenue.toLocaleString()} ₽
                            </Text>
                        </VStack>

                        <VStack align="start" gap={0}>
                            <Text fontSize="sm" color="fg.muted">
                                Чаевые
                            </Text>
                            <Text fontWeight="medium">
                                {checkpoint.tips.toLocaleString()} ₽
                            </Text>
                        </VStack>
                    </HStack>

                    {/* Updated at */}
                    <Text fontSize="xs" color="fg.muted">
                        Дата и время:{" "}
                        {new Date(checkpoint.dateTime).toLocaleString()}
                    </Text>
                </Stack>
            </Card.Body>
            <Card.Footer>
                <Button
                    aria-label="Edit"
                    variant="outline"
                    size="sm"
                    onClick={onEdit}
                >
                    <Pencil size={16}/> Изменить
                </Button>

                <Button
                    aria-label="Delete"
                    variant="surface"
                    size="sm"
                    colorPalette="red"
                    onClick={onDeleteRequested}
                >
                    <Trash size={16}/> Удалить
                </Button>
            </Card.Footer>
        </Card.Root>
    );
}