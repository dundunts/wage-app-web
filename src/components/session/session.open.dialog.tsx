"use client";

import {
    Button,
    Dialog,
    Field,
    HStack,
    Input,
    useDisclosure,
    VStack,
} from "@chakra-ui/react";
import { useState } from "react";
import { useRouter } from "next/navigation";
import {Company} from "@/types/company.types";
import {sessionService} from "@/service/session/session.service";
import {toLocalDateTimeInputValue} from "@/utils/date.utils";
import {feedback} from "@/feedback/feedback";
import {feedbackMessages} from "@/feedback/messages";

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
    const [isPending, setIsPending] = useState(false);
    const router = useRouter();

    const submit = async () => {
        if (isPending) return;

        const action = feedback.beginAction("shiftSessionOpen");
        setIsPending(true);
        try {
            const session = await sessionService.open({
                companyId: company.id,
                startWorkAt: dateTime,
            });
            action.success();
            onClose();
            router.push(`/calculator/checkpoints?sessionId=${session.id}`);
        } catch (error) {
            action.error(error);
        } finally {
            setIsPending(false);
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
                closeOnEscape={!isPending}
                closeOnInteractOutside={!isPending}
                onOpenChange={(details) => {
                    if (!details.open && !isPending) {
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
                                <Field.Root>
                                    <Field.Label>Дата и время начала</Field.Label>
                                    <Input
                                        type="datetime-local"
                                        value={toLocalDateTimeInputValue(dateTime)}
                                        onChange={(e) => setDateTime(new Date(e.target.value))}
                                    />
                                </Field.Root>
                            </VStack>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <HStack justify="flex-end" gap={2}>
                                <Button
                                    variant="subtle"
                                    onClick={onClose}
                                    disabled={isPending}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    colorPalette="blue"
                                    onClick={submit}
                                    loading={isPending}
                                    loadingText={feedbackMessages.shiftSessionOpen.loading}
                                    disabled={isPending}
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
