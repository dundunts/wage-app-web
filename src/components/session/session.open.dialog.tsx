"use client";

import {
    Box,
    Button,
    Dialog, HStack,
    Input,
    Text,
    useDisclosure, VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {Company} from "@/types/company.types";
import {sessionService} from "@/service/session/session.service";
import {toLocalDateTimeInputValue} from "@/utils/date.utils";

interface Props {
    company: Company;
}

export function SessionOpenDialog({ company }: Props) {
    const { open, onOpen, onClose } = useDisclosure();

    function getInitDate(startTime: string): Date {
        const now = new Date()
        const parts = startTime.split(":").map(v => Number(v))
        now.setHours(parts[0], parts[1])
        return now
    }

    const [dateTime, setDateTime] = useState(getInitDate(company.defaultShiftStartTime));
    const router = useRouter();

    const submit = async () => {
        sessionService.open({
            companyId: company.id,
            startWorkAt: dateTime,
        }).then(session => router.push(
            `/calculator/checkpoints?sessionId=${session.id}`
        ))
    };

    return (
        <>
            <Button
                onClick={() => onOpen()}
                colorPalette="blue"
            >
                Открыть сессию
            </Button>

            <Dialog.Root
                open={open}
                onOpenChange={(details) => {
                    if (!details.open) {
                        onClose();
                    }
                }}
            >
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content maxW="400px">
                        <Dialog.Header>
                            <Dialog.Title>Открытие сессии</Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <VStack align="stretch" gap={4}>
                                <Box>
                                    <Text fontSize="sm" mb={2} color="fg.muted">
                                        Дата и время начала
                                    </Text>
                                    <Input
                                        type="datetime-local"
                                        value={toLocalDateTimeInputValue(dateTime)}
                                        onChange={(e) => setDateTime(new Date(e.target.value))}
                                    />
                                </Box>
                            </VStack>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <HStack justify="flex-end" gap={2}>
                                <Button
                                    variant="ghost"
                                    onClick={onOpen}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    colorPalette="blue"
                                    onClick={submit}
                                >
                                    Открыть
                                </Button>
                            </HStack>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Dialog.Root>
        </>
    );
}
