// @/app/results/[id]/page.tsx
"use client";

import {use, useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {
    Badge,
    Box,
    Button,
    Card,
    Container,
    Flex,
    Heading,
    Separator,
    Spinner,
    Stack,
    Text
} from "@chakra-ui/react";
import {shiftResultService} from "@/service/results/shiftResult.service";
import {CalculationSource, ShiftResultDetailed} from "@/types/shiftResult.types";
import {ConfirmationDialog} from "@/components/dialog/ConfirmationDialog";
import {feedback} from "@/feedback/feedback";
import {feedbackMessages} from "@/feedback/messages";
import {PaymentCard} from "@/components/results/PaymentCard";

const calculationSourceLabels: Record<CalculationSource, string> = {
    [CalculationSource.CHECKPOINTS]: "По контрольным точкам",
    [CalculationSource.MANUAL_OVERRIDE]: "Ручной расчёт",
};

// В Next.js 16 params - это Promise
export default function ResultDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // Разворачиваем параметры через хук use() (React 19 фича)
    const { id } = use(params);

    const router = useRouter();
    const [data, setData] = useState<ShiftResultDetailed | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeletePending, setDeletePending] = useState(false);
    const deleteTriggerRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const resultRes = await shiftResultService.getDetailed(id);
                setData(resultRes.shiftResult);
            } catch (e) {
                feedback.beginAction("shiftResultDetailLoad").error(e);
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDelete = async () => {
        if (isDeletePending) return;

        const actionFeedback = feedback.beginAction("shiftResultDelete");
        setDeletePending(true);
        try {
            await shiftResultService.delete(id);
            actionFeedback.success();
            setDeleteDialogOpen(false);
            router.push("/results");
        } catch(error) {
            actionFeedback.error(error);
        } finally {
            setDeletePending(false);
        }
    };

    if (isLoading) {
        return (
            <Flex role="status" aria-label="Результат смены загружается" justify="center" p={20}>
                <Spinner size="xl" color="accent" />
            </Flex>
        );
    }
    if (!data) return <Box role="status" p={10} color="fg.muted">Данные не найдены</Box>;

    return (
        <Container maxW="4xl" px={{base: 4, md: 6}} py={{base: 6, md: 8}}>
            <Flex
                justify="space-between"
                align={{base: "stretch", md: "end"}}
                direction={{base: "column", md: "row"}}
                gap={4}
                mb={6}
            >
                <Box>
                    <Button variant="subtle" size="sm" mb={2} onClick={() => router.push("/results")}>
                        ← Назад к списку
                    </Button>
                    <Heading as="h1" size={{base: "lg", md: "xl"}}>
                        Смена от {new Date(data.date).toLocaleDateString("ru-RU")}
                    </Heading>
                </Box>
                <Flex gap={3} direction={{base: "column", sm: "row"}}>
                    <Button
                        ref={deleteTriggerRef}
                        colorPalette="danger"
                        variant="solid"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        Удалить
                    </Button>
                </Flex>
            </Flex>

            <Card.Root>
                <Card.Body>
                    <Stack gap={6} separator={<Separator />}>
                        <Box>
                            <Text color="fg.muted" fontSize="sm">Источник расчёта</Text>
                            <Badge
                                mt={2}
                                size="lg"
                                variant="outline"
                                color="status.info"
                                borderColor="status.info"
                                bg="bg.subtle"
                            >
                                {calculationSourceLabels[data.calculationSource]}
                            </Badge>
                        </Box>

                        <Box>
                            <Heading size="md" mb={4}>Детализация выплат</Heading>
                            <Stack gap={4}>
                                {data.payments.map((payment) => (
                                    <PaymentCard
                                        key={payment.id}
                                        payment={payment}
                                        requiresAttention={data.calculationSource === CalculationSource.MANUAL_OVERRIDE}
                                    />
                                ))}
                            </Stack>
                        </Box>
                    </Stack>
                </Card.Body>
            </Card.Root>

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                title="Удалить результат смены?"
                description="Результат смены будет удалён без возможности восстановления."
                confirmLabel="Удалить"
                cancelLabel="Отмена"
                pendingLabel={feedbackMessages.shiftResultDelete.loading}
                severity="danger"
                pending={isDeletePending}
                finalFocusEl={() => deleteTriggerRef.current}
                onCancel={() => {
                    if (!isDeletePending) {
                        setDeleteDialogOpen(false);
                    }
                }}
                onConfirm={handleDelete}
            />
        </Container>
    );
}
