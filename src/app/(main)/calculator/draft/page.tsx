"use client";

import {Box, Button, Flex, Heading, Spinner, Stack, Text} from "@chakra-ui/react";
import {AlertTriangle, ArrowLeft, Check} from "lucide-react";
import {EmployeePaymentDraftCard, ShiftResultsDraftTable} from "@/components/shift/shift.results.draft.components";
import React, {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {ShiftResultDraft} from "@/types/draft.types";
import {calculationService} from "@/service/calculation/calculation.service";
import {feedback} from "@/feedback/feedback";
import {feedbackMessages} from "@/feedback/messages";
import {
    CalculatorStageContainer,
    CalculatorStageHeader,
} from "@/components/calculator/calculator-stage";

type PendingAction = "confirm" | "discard" | null;

export default function DraftPage() {
    const searchParams = useSearchParams();

    const sessionId = searchParams.get("sessionId");

    const router = useRouter()

    const [resultDraft, setResultDraft] = useState<ShiftResultDraft | undefined>(undefined)

    const [isLoading, setLoading] = useState(true)

    const [error, setError] = useState("")

    const [pendingAction, setPendingAction] = useState<PendingAction>(null)

    useEffect(() => {
        loadData()
    }, []);
    
    async function loadData(reportFailure = false) {
        if (!sessionId) return;
        
        setLoading(true)
        setError("")
        
        try {
            const draft = await calculationService.getDraftForSession(sessionId)
            draft.payments.sort((a, b) => (b.tips + b.percentFromRevenue) - (a.tips + a.percentFromRevenue))
            setResultDraft(draft)
        } catch (e) {
            console.error("Error while loading data", e)
            setError("Не удалось загрузить Shift Result Draft")
            if (reportFailure) {
                feedback.beginAction("shiftResultDraftLoad").error(e)
            }
        } finally {
            setLoading(false)
        }
    }

    async function handleBackToCheckpoints() {
        if (!resultDraft || pendingAction) return;

        setPendingAction("discard")
        const actionFeedback = feedback.beginAction("shiftResultDraftDiscard")
        try {
            await calculationService.deleteDraft(resultDraft.id);
            actionFeedback.success()
            router.replace(`/calculator/checkpoints?sessionId=${sessionId}`)
        } catch (error) {
            actionFeedback.error(error)
        } finally {
            setPendingAction(null)
        }
    }

    async function handleAcceptResults() {
        if (!resultDraft || pendingAction) return;

        setPendingAction("confirm")
        const actionFeedback = feedback.beginAction("shiftResultDraftConfirm")
        try {
            const res = await calculationService.confirmDraft(resultDraft.id)
            actionFeedback.success()
            router.replace(`/results/${res.resultId}`)
        } catch (error) {
            actionFeedback.error(error)
        } finally {
            setPendingAction(null)
        }
    }

    if (isLoading) {
        return (
            <CalculatorStageContainer>
                <Stack role="status" aria-label="Shift Result Draft загружается" align="center" py={10} color="fg.muted">
                    <Spinner size="lg" />
                </Stack>
            </CalculatorStageContainer>
        );
    }

    if (error) {
        return (
            <CalculatorStageContainer>
                <Stack gap={6}>
                    <CalculatorStageHeader
                        currentStage={3}
                        title="Проверьте расчёт за день"
                        description="Подтвердите рассчитанные Payment или вернитесь к Checkpoint для корректировки."
                    />
                    <Stack
                        role="alert"
                        gap={3}
                        p={{base: 4, md: 5}}
                        bg="bg.panel"
                        borderWidth="1px"
                        borderColor="status.danger"
                        borderRadius="panel"
                    >
                        <Heading as="h2" size="md">Shift Result Draft не загружен</Heading>
                        <Text color="status.danger">{error}</Text>
                        <Button alignSelf="flex-start" variant="outline" onClick={() => void loadData(true)}>
                            Повторить
                        </Button>
                    </Stack>
                </Stack>
            </CalculatorStageContainer>
        );
    }
    
    if (!resultDraft) return;

    return (
        <CalculatorStageContainer>
            <Stack gap={6} aria-busy={pendingAction !== null}>
                <CalculatorStageHeader
                    currentStage={3}
                    title="Проверьте расчёт за день"
                    description="Подтвердите рассчитанные Payment или вернитесь к Checkpoint для корректировки."
                />

                <Flex
                    role="status"
                    align="center"
                    gap={2}
                    px={4}
                    py={3}
                    color="status.warning"
                    bg="bg.subtle"
                    borderWidth="1px"
                    borderColor="status.warning"
                    borderRadius="control"
                >
                    <AlertTriangle size={18} aria-hidden="true" />
                    <Text fontSize="sm">Это черновик: Payment будут зафиксированы только после подтверждения.</Text>
                </Flex>

                {/* Shift controls */}
                <Flex
                    align={{base: "stretch", md: "center"}}
                    justify="space-between"
                    direction={{base: "column", md: "row"}}
                    gap={4}
                    bg="bg.panel"
                    borderWidth="1px"
                    borderColor="border"
                    borderRadius="panel"
                    boxShadow="panel"
                    p={{base: 4, md: 5}}
                >
                    <Text fontSize="sm" color="fg.muted">
                        Начало смены: {resultDraft.date.toLocaleString()}
                    </Text>

                    <Stack direction={{base: "column-reverse", md: "row"}} w={{base: "full", md: "auto"}}>
                        <Button
                            variant="outline"
                            color="status.warning"
                            borderColor="status.warning"
                            onClick={handleBackToCheckpoints}
                            disabled={pendingAction !== null}
                            loading={pendingAction === "discard"}
                            loadingText={feedbackMessages.shiftResultDraftDiscard.loading}
                        >
                            <ArrowLeft/> Назад
                        </Button>
                        <Button
                            colorPalette="brand"
                            onClick={handleAcceptResults}
                            disabled={pendingAction !== null}
                            loading={pendingAction === "confirm"}
                            loadingText={feedbackMessages.shiftResultDraftConfirm.loading}
                        >
                            <Check/> Завершить смену
                        </Button>
                    </Stack>
                </Flex>

                <Stack gap={4}>
                    {resultDraft.payments.length === 0 && (
                        <Box
                            py={8}
                            px={4}
                            textAlign="center"
                            color="fg.muted"
                            bg="bg.panel"
                            borderWidth="1px"
                            borderColor="border"
                            borderRadius="panel"
                        >
                            <Text>Нет данных для расчёта</Text>
                        </Box>
                    )}

                    {/* Desktop table */}
                    <Box
                        display={{base: "none", md: "block"}}
                        overflowX="auto"
                        borderWidth="1px"
                        borderColor="border"
                        borderRadius="panel"
                    >
                        <ShiftResultsDraftTable resultsDraft={resultDraft}/>
                    </Box>

                    {/* Mobile cards */}
                    <Stack gap={3} display={{base: "flex", md: "none"}}>
                        {resultDraft.payments.map((p) =>
                            <EmployeePaymentDraftCard key={p.employee.id} payment={p}/>
                        )}
                    </Stack>
                </Stack>
            </Stack>
        </CalculatorStageContainer>
    );
}
