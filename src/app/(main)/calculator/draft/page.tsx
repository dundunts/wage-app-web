"use client";

import {Box, Button, Container, Flex, Heading, Spinner, Stack, Text} from "@chakra-ui/react";
import {ArrowLeft, Check} from "lucide-react";
import {EmployeePaymentDraftCard, ShiftResultsDraftTable} from "@/components/shift/shift.results.draft.components";
import React, {useEffect, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {ShiftResultDraft} from "@/types/draft.types";
import {PageHeader} from "@/components/page/PageHeader";
import {EmptyState} from "@/components/page/EmptyState";
import {calculationService} from "@/service/calculation/calculation.service";
import {feedback} from "@/feedback/feedback";
import {feedbackMessages} from "@/feedback/messages";

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
    
    async function loadData() {
        if (!sessionId) return;
        
        setLoading(true)
        
        try {
            const draft = await calculationService.getDraftForSession(sessionId)
            draft.payments.sort((a, b) => (b.tips + b.percentFromRevenue) - (a.tips + a.percentFromRevenue))
            setResultDraft(draft)
        } catch (e) {
            console.error("Error while loading data", e)
            setError("Error while loading data")
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
            <Stack align="center" mt={10}>
                <Spinner size="lg" />
            </Stack>
        );
    }

    if (error) {
        return (
            <Stack gap={6}>
                <PageHeader title="Выбор компании" />
                <EmptyState title="Ошибка" description={error} />
            </Stack>
        );
    }
    
    if (!resultDraft) return;

    return (
        <Container maxW="breakpoint-lg" py={6}>
            <Stack gap={6}>
                {/* Page header */}
                <Heading size="lg">Расчёт за день</Heading>

                {/* Shift controls */}
                <Flex
                    align={{base: "stretch", md: "center"}}
                    justify="space-between"
                    direction={{base: "column", md: "row"}}
                    gap={4}
                >
                    <Text fontSize="sm" color="fg.muted">
                        Начало смены: {resultDraft.date.toLocaleString()}
                    </Text>

                    <Stack direction={{base: "column", md: "row"}}>
                        <Button
                            variant="outline"
                            onClick={handleBackToCheckpoints}
                            disabled={pendingAction !== null}
                            loading={pendingAction === "discard"}
                            loadingText={feedbackMessages.shiftResultDraftDiscard.loading}
                        >
                            <ArrowLeft/> Назад
                        </Button>
                        <Button
                            colorPalette="teal"
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
                        <Text color="fg.muted">
                            Нет данных для расчёта
                        </Text>
                    )}

                    {/* Desktop table */}
                    <Box display={{base: "none", md: "block"}}>
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
        </Container>
    );
}
