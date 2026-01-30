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

interface Props {
    company: Company;
}

export function OpenSessionModal({ company }: Props) {
    const { open, onOpen, onClose } = useDisclosure();

    function getInitDate(startTime: string): string {
        const now = new Date()
        const parts = startTime.split(":").map(v => Number(v))
        now.setHours(parts[0], parts[1])
        return now.toISOString().slice(0, 16)
    }

    const [dateTime, setDateTime] = useState(getInitDate(company.defaultShiftStartTime));
    const router = useRouter();

    const submit = async () => {
        const res = await fetch(
            "/api/external/session/open",
            {
                method: "POST",
                body: JSON.stringify({
                    companyId: company.id,
                    startWorkAt: new Date(dateTime).toISOString(),
                }),
            }
        );

        if (res.ok) {
            const session = await res.json();
            router.push(
                `/calculator/checkpoints?sessionId=${session.id}`
            );
        }
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
                                        value={dateTime}
                                        onChange={(e) => setDateTime(e.target.value)}
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
