// @/app/calculator/checkpoints/page.tsx
"use client";

import React, {useEffect, useRef, useState} from 'react';
import {
    Box,
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    IconButton,
    Separator,
    Spinner,
    Stack,
    Text,
    useDisclosure
} from "@chakra-ui/react";
import {Calculator, Calendar, Clock, Lock, Plus} from "lucide-react";
import {useRouter, useSearchParams} from "next/navigation";

// Types & Services
import {Session} from "@/types/session.types";
import {
    Checkpoint,
    CheckpointPayload,
    CreateRegularCheckpointPayload,
    UpdateShiftCheckpointPayload
} from "@/types/checkpoint.types";
import {CompanyEmployeeInfo} from "@/types/employee.types";
import {sessionService} from "@/service/session/session.service";
import {checkpointService} from "@/service/checpoint/checkpoint.service";
import {employeeService} from "@/service/employee/employee.service";

// Components
import {ShiftCheckpointCard} from "@/components/shift/shift.checkpoint.components.card";
import {CheckpointDialog} from "@/components/shift/shift.checkpoint.components.dialog";
import {SessionUpdateTimeDialog} from "@/components/session/session.update-time.dialog";
import {ConfirmationDialog} from "@/components/dialog/ConfirmationDialog";
import {feedback} from "@/feedback/feedback";
import {feedbackMessages} from "@/feedback/messages";

function CalcInShiftPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("sessionId");
    const router = useRouter();

    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [session, setSession] = useState<Session | undefined>(undefined);
    const [availableEmployees, setAvailableEmployees] = useState<CompanyEmployeeInfo[]>([]);
    const [isUpdatingTime, setIsUpdatingTime] = useState(false);
    const [isClosingSession, setIsClosingSession] = useState(false);
    const [isCreatingCheckpoint, setIsCreatingCheckpoint] = useState(false);
    const [isUpdatingCheckpoint, setIsUpdatingCheckpoint] = useState(false);
    const [isDeletingCheckpoint, setIsDeletingCheckpoint] = useState(false);
    const closeSessionTriggerRef = useRef<HTMLButtonElement>(null);

    // Dialog states
    const {open: isCreateDialogOpened, onOpen: onOpenCreateDialog, onClose: onCloseCreateDialog} = useDisclosure();

    // Новые диалоги
    const {
        open: isTimeDialogOpen,
        onOpen: onOpenTimeDialog,
        onClose: onCloseTimeDialog
    } = useDisclosure();

    const {
        open: isCloseSessionDialogOpen,
        onOpen: onOpenCloseSessionDialog,
        onClose: onCloseCloseSessionDialog
    } = useDisclosure();

    const [targetIdForRemove, setTargetIdForRemove] = useState<string | null>(null);
    const [targetForEdit, setTargetForEdit] = useState<Checkpoint | null>(null);

    useEffect(() => {
        loadData();
    }, []);

    async function loadData(showLoading = true) {
        if (!sessionId) return;

        if (showLoading) setLoading(true);
        try {
            const sessionData = await sessionService.getAvailableById(sessionId);

            if (sessionData.status === "OPENED_DRAFT" || sessionData.status === "RECALCULATING_DRAFT") {
                router.push(`/calculator/draft?sessionId=${sessionId}`);
                return;
            }

            const employees = await employeeService.getAvailableEmployeesForCompany(sessionData.companyId);

            setSession(sessionData);
            setAvailableEmployees(employees);
        } catch (e) {
            console.error(e);
            setError("Не удалось загрузить данные сессии");
        } finally {
            if (showLoading) setLoading(false);
        }
    }

    // --- Checkpoint Handlers ---

    async function handleCreateCheckpoint(payload: CheckpointPayload) {
        if (!session || isCreatingCheckpoint) return;
        const action = feedback.beginAction("checkpointCreate");
        setIsCreatingCheckpoint(true);

        const createPayload: CreateRegularCheckpointPayload = {
            ...payload,
            sessionId: session.id
        };

        try {
            await checkpointService.create(createPayload);
            action.success();
            onCloseCreateDialog();
            void loadData(false);
        } catch (error) {
            action.error(error);
        } finally {
            setIsCreatingCheckpoint(false);
        }
    }

    async function handleUpdateCheckpoint(payload: CheckpointPayload) {
        if (!targetForEdit || isUpdatingCheckpoint) return;
        const action = feedback.beginAction("checkpointUpdate");
        setIsUpdatingCheckpoint(true);

        const updatePayload: UpdateShiftCheckpointPayload = {
            ...payload,
            id: targetForEdit.id
        };

        try {
            await checkpointService.update(updatePayload);
            action.success();
            setTargetForEdit(null);
            void loadData(false);
        } catch (error) {
            action.error(error);
        } finally {
            setIsUpdatingCheckpoint(false);
        }
    }

    async function handleDeleteCheckpoint() {
        if (!targetIdForRemove || isDeletingCheckpoint) return;
        const action = feedback.beginAction("checkpointDelete");
        setIsDeletingCheckpoint(true);

        try {
            await checkpointService.delete(targetIdForRemove);
            action.success();
            setTargetIdForRemove(null);
            void loadData(false);
        } catch (error) {
            action.error(error);
        } finally {
            setIsDeletingCheckpoint(false);
        }
    }

    // --- Session Handlers (NEW) ---

    async function handleUpdateSessionTime(newTime: string) {
        if (!session || isUpdatingTime) return;

        const action = feedback.beginAction("shiftSessionUpdateTime");
        setIsUpdatingTime(true);
        try {
            await sessionService.updateStartWorkTime({
                sessionId: session.id,
                startWorkTime: newTime
            });
            setSession((current) => current ? {...current, startWorkTime: newTime} : current);
            action.success();
            onCloseTimeDialog();
        } catch (error) {
            action.error(error);
        } finally {
            setIsUpdatingTime(false);
        }
    }

    async function handleCloseSession() {
        if (!session || isClosingSession) return;

        const action = feedback.beginAction("shiftSessionClose");
        setIsClosingSession(true);
        try {
            await sessionService.close(session.id);
            action.success();
            onCloseCloseSessionDialog();
            router.push(`/calculator`);
        } catch (error) {
            action.error(error);
        } finally {
            setIsClosingSession(false);
        }
    }

    function handleGoToResults() {
        router.push(`/calculator/draft?sessionId=${sessionId}`);
    }

    if (isLoading) return (
        <Stack align="center" py={10}>
            <Spinner size="xl" />
        </Stack>
    );

    if (error) return (
        <Stack
            role="alert"
            py={6}
            px={4}
            align="center"
            bg="bg.panel"
            borderWidth="1px"
            borderColor="status.danger"
            borderRadius="panel"
        >
            <Text color="status.danger" fontSize="lg">{error}</Text>
            <Button variant="outline" onClick={() => window.location.reload()}>Попробовать снова</Button>
        </Stack>
    );

    if (!session) return null;

    const {checkpoints} = session;
    const sessionDate = new Date(session.date).toLocaleDateString("ru-RU", {
        day: "numeric",
        month: "long",
        year: "numeric"
    });

    return (
        <Container maxW="breakpoint-lg" pt={6} pb={{base: 24, md: 6}}>
            <Stack gap={6}>
                {/* Page header */}
                <Box>
                    <Text color="accent" fontSize="xs" fontWeight="bold" letterSpacing="wide" textTransform="uppercase">
                        Этап 2 · Checkpoint
                    </Text>
                    <Heading size="lg">Расчёт за день</Heading>
                    <Text mt={1} color="fg.muted" fontSize="sm">
                        Фиксируйте Revenue, Restaurant Tips и состав команды по ходу Shift Session.
                    </Text>
                </Box>

                {/* Shift controls */}
                <Flex
                    align={{base: "stretch", md: "center"}}
                    justify="space-between"
                    direction={{base: "column", md: "row"}}
                    gap={4}
                    bg="bg.panel"
                    p={{base: 4, md: 5}}
                    borderRadius="panel"
                    borderWidth="1px"
                    borderColor="border"
                    boxShadow="panel"
                    as="section"
                    aria-label="Управление Shift Session"
                >
                    {/* Date & Time selector */}
                    <Stack gap={1}>
                        <HStack color="fg.muted" fontSize="sm">
                            <Calendar size={16}/>
                            <Text fontWeight="medium">{sessionDate}</Text>
                        </HStack>

                        <HStack>
                            <Text fontSize="sm" color="fg.muted">
                                Начало:
                            </Text>
                            <Button
                                variant="subtle"
                                size="sm"
                                height="auto"
                                px={2}
                                py={1}
                                onClick={onOpenTimeDialog}
                                colorPalette="brand"
                            >
                                <Clock size={16} style={{marginRight: '6px'}}/>
                                <Text fontWeight="bold" fontSize="md">{session.startWorkTime}</Text>
                            </Button>
                        </HStack>
                    </Stack>

                    {/* Actions */}
                    <HStack gap={3} wrap="wrap" w={{base: "full", md: "auto"}}>
                        <Button
                            ref={closeSessionTriggerRef}
                            variant="outline"
                            color="status.danger"
                            borderColor="status.danger"
                            onClick={onOpenCloseSessionDialog}
                            flex={{base: "1 1 auto", md: "initial"}}
                        >
                            <Lock size={16}/> Закрыть смену
                        </Button>

                        <Separator orientation="vertical" height="24px" hideBelow="md" />

                        <Button
                            colorPalette="brand"
                            onClick={handleGoToResults}
                            disabled={checkpoints.length <= 0}
                            flex={{base: "1 1 auto", md: "initial"}}
                        >
                            <Calculator/> К результатам
                        </Button>
                    </HStack>
                </Flex>

                <Stack gap={4} direction="column-reverse">
                    {checkpoints.map((checkpoint, index) => (
                        <ShiftCheckpointCard
                            key={checkpoint.id}
                            checkpoint={checkpoint}
                            position={index + 1}
                            onDeleteRequested={() => setTargetIdForRemove(checkpoint.id)}
                            onEdit={() => setTargetForEdit(checkpoint)}
                        />
                    ))}

                    {checkpoints.length === 0 && (
                        <Stack
                            align="center"
                            py={8}
                            px={4}
                            color="fg.muted"
                            bg="bg.panel"
                            borderWidth="1px"
                            borderColor="border"
                            borderRadius="panel"
                        >
                            <Text fontSize="lg" fontWeight="medium">Чекпоинты ещё не добавлены</Text>
                            <Text fontSize="sm">Нажмите кнопку &quot;+&#34; внизу справа, чтобы добавить первую запись</Text>
                        </Stack>
                    )}
                </Stack>
            </Stack>

            {/* Floating Action Button */}
            <IconButton
                aria-label="Добавить чекпоинт"
                position="fixed"
                bottom={{base: "calc(env(safe-area-inset-bottom) + 1rem)", md: 6}}
                right={{base: "calc(env(safe-area-inset-right) + 1rem)", md: 6}}
                size="xl"
                colorPalette="brand"
                borderRadius="full"
                boxShadow="accent"
                onClick={onOpenCreateDialog}
                _hover={{ transform: "translateY(-1px)" }}
                _motionReduce={{transform: "none", transitionDuration: "0ms"}}
                transitionDuration="quiet"
            >
                <Plus />
            </IconButton>

            {/* --- Dialogs --- */}

            {/* Create dialog */}
            <CheckpointDialog
                companyEmployees={availableEmployees}
                open={isCreateDialogOpened}
                pending={isCreatingCheckpoint}
                pendingLabel={feedbackMessages.checkpointCreate.loading}
                onClose={onCloseCreateDialog}
                onSave={handleCreateCheckpoint}
            />

            {/* Update dialog */}
            {targetForEdit && (
                <CheckpointDialog
                    origin={targetForEdit}
                    companyEmployees={availableEmployees}
                    open={!!targetForEdit}
                    pending={isUpdatingCheckpoint}
                    pendingLabel={feedbackMessages.checkpointUpdate.loading}
                    onClose={() => setTargetForEdit(null)}
                    onSave={handleUpdateCheckpoint}
                />
            )}

            {/* Confirm delete dialog */}
            <ConfirmationDialog
                open={!!targetIdForRemove}
                title="Удалить чекпоинт?"
                description="Чекпоинт будет удалён без возможности восстановления."
                confirmLabel="Удалить"
                cancelLabel="Отмена"
                pendingLabel={feedbackMessages.checkpointDelete.loading}
                severity="danger"
                pending={isDeletingCheckpoint}
                onCancel={() => {
                    if (!isDeletingCheckpoint) setTargetIdForRemove(null);
                }}
                onConfirm={handleDeleteCheckpoint}
            />

            {/* Update Time Dialog (NEW) */}
            <SessionUpdateTimeDialog
                open={isTimeDialogOpen}
                onClose={onCloseTimeDialog}
                currentStartTime={session.startWorkTime}
                onSave={handleUpdateSessionTime}
                isLoading={isUpdatingTime}
            />

            <ConfirmationDialog
                open={isCloseSessionDialogOpen}
                title="Закрыть смену?"
                description="После закрытия редактирование чекпоинтов будет недоступно, и начнётся финальный пересчёт."
                confirmLabel="Закрыть смену"
                cancelLabel="Отмена"
                pendingLabel={feedbackMessages.shiftSessionClose.loading}
                severity="danger"
                pending={isClosingSession}
                finalFocusEl={() => closeSessionTriggerRef.current}
                onCancel={onCloseCloseSessionDialog}
                onConfirm={handleCloseSession}
            />
        </Container>
    );
}

export default CalcInShiftPage;
