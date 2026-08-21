"use client";

import {
    Button,
    Dialog,
    Field,
    Input,
    Portal,
    Stack,
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
                colorPalette="brand"
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
                <Portal>
                    <Dialog.Backdrop />
                    <Dialog.Positioner p={{base: 3, sm: 4}}>
                    <Dialog.Content
                        maxW="400px"
                        bg="bg.raised"
                        borderWidth="1px"
                        borderColor="border.emphasized"
                    >
                        <Dialog.Header>
                            <Dialog.Title>Открытие сессии</Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <VStack align="stretch" gap={4}>
                                <Field.Root>
                                    <Field.Label>Дата и время начала</Field.Label>
                                    <Input
                                        type="datetime-local"
                                        colorScheme="light dark"
                                        disabled={isPending}
                                        value={toLocalDateTimeInputValue(dateTime)}
                                        onChange={(e) => setDateTime(new Date(e.target.value))}
                                    />
                                </Field.Root>
                            </VStack>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Stack
                                direction={{base: "column-reverse", sm: "row"}}
                                justify="flex-end"
                                gap={2}
                                w="full"
                            >
                                <Button
                                    variant="subtle"
                                    onClick={onClose}
                                    disabled={isPending}
                                    w={{base: "full", sm: "auto"}}
                                >
                                    Отмена
                                </Button>
                                <Button
                                    colorPalette="brand"
                                    onClick={submit}
                                    loading={isPending}
                                    loadingText={feedbackMessages.shiftSessionOpen.loading}
                                    disabled={isPending}
                                    w={{base: "full", sm: "auto"}}
                                >
                                    Открыть
                                </Button>
                            </Stack>
                        </Dialog.Footer>
                    </Dialog.Content>
                    </Dialog.Positioner>
                </Portal>
            </Dialog.Root>
        </>
    );
}
