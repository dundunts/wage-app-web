// @/app/calculator/checkpoints/page.tsx
"use client";

import React, {useEffect, useState} from 'react';
import {
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
import ConfirmDeleteDialog from "@/components/dialog/components.dialog.confirmation.delete";
import {SessionUpdateTimeDialog} from "@/components/session/session.update-time.dialog";
import {SessionCloseDialog} from "@/components/session/session.close.dialog";

function CalcInShiftPage() {
    const searchParams = useSearchParams();
    const sessionId = searchParams.get("sessionId");
    const router = useRouter();

    const [isLoading, setLoading] = useState(true);
    const [error, setError] = useState("");
    const [session, setSession] = useState<Session | undefined>(undefined);
    const [availableEmployees, setAvailableEmployees] = useState<CompanyEmployeeInfo[]>([]);

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

    async function loadData() {
        if (!sessionId) return;

        setLoading(true);
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
            setLoading(false);
        }
    }

    // --- Checkpoint Handlers ---

    function handleCreateCheckpoint(payload: CheckpointPayload) {
        if (!session) return;
        setLoading(true);

        const createPayload: CreateRegularCheckpointPayload = {
            ...payload,
            sessionId: session.id
        };

        checkpointService.create(createPayload)
            .then(() => {
                loadData();
                onCloseCreateDialog();
            })
            .catch(() => setError("Ошибка при создании чекпоинта"))
            .finally(() => setLoading(false));
    }

    function handleUpdateCheckpoint(payload: CheckpointPayload) {
        if (!targetForEdit) return;
        setLoading(true);

        const updatePayload: UpdateShiftCheckpointPayload = {
            ...payload,
            id: targetForEdit.id
        };

        checkpointService.update(updatePayload)
            .then(() => {
                loadData();
                setTargetForEdit(null);
            })
            .catch(() => setError("Ошибка при обновлении чекпоинта"))
            .finally(() => setLoading(false));
    }

    function handleDeleteCheckpoint() {
        if (!targetIdForRemove) return;
        setLoading(true);

        checkpointService.delete(targetIdForRemove)
            .then(() => {
                loadData();
                setTargetIdForRemove(null);
            })
            .catch(() => setError("Ошибка при удалении чекпоинта"))
            .finally(() => setLoading(false));
    }

    // --- Session Handlers (NEW) ---

    function handleUpdateSessionTime(newTime: string) {
        if (!session) return;
        setLoading(true);

        sessionService.updateStartWorkTime({
            sessionId: session.id,
            startWorkTime: newTime
        })
            .then(() => {
                loadData(); // Перезагружаем, чтобы обновить данные в UI
                onCloseTimeDialog();
            })
            .catch((e) => {
                console.error(e);
                // В реальном проекте здесь стоит добавить Toast notification
                setError("Не удалось обновить время начала смены");
                setLoading(false); // Снимаем лоадинг только если ошибка, иначе loadData сам снимет
            });
    }

    function handleCloseSession() {
        if (!session) return;
        setLoading(true);

        sessionService.close(session.id)
            .then(() => {
                // После успешного закрытия переходим на драфт (или страницу результатов)
                router.push(`/calculator`);
            })
            .catch((e) => {
                console.error(e);
                setError("Не удалось закрыть смену");
                setLoading(false);
                onCloseCloseSessionDialog();
            });
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
        <Stack py={6} align="center">
            <Text color="red.500" fontSize="lg">{error}</Text>
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

    //TODO delete logs
    console.log("Checkpoints page. Checkpoints:", checkpoints)

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
                    bg="bg.subtle"
                    p={4}
                    borderRadius="md"
                    borderWidth="1px"
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
                                colorPalette="teal"
                            >
                                <Clock size={16} style={{marginRight: '6px'}}/>
                                <Text fontWeight="bold" fontSize="md">{session.startWorkTime}</Text>
                            </Button>
                        </HStack>
                    </Stack>

                    {/* Actions */}
                    <HStack gap={3} wrap="wrap">
                        <Button
                            colorPalette="red"
                            variant="surface"
                            onClick={onOpenCloseSessionDialog}
                        >
                            <Lock size={16}/> Закрыть смену
                        </Button>

                        <Separator orientation="vertical" height="24px" hideBelow="md" />

                        <Button
                            colorPalette="teal"
                            onClick={handleGoToResults}
                            disabled={checkpoints.length <= 0}
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
                        <Stack align="center" py={8} opacity={0.6}>
                            <Text fontSize="lg" fontWeight="medium">Чекпоинты ещё не добавлены</Text>
                            <Text fontSize="sm">Нажмите кнопку &quot;+&#34; внизу справа, чтобы добавить первую запись</Text>
                        </Stack>
                    )}
                </Stack>
            </Stack>

            {/* Floating Action Button */}
            <IconButton
                aria-label="Add checkpoint"
                position="fixed"
                bottom={6}
                right={6}
                size="xl"
                colorPalette="teal"
                borderRadius="full"
                boxShadow="xl"
                onClick={onOpenCreateDialog}
                _hover={{ transform: "scale(1.1)" }}
                transition="all 0.2s"
            >
                <Plus />
            </IconButton>

            {/* --- Dialogs --- */}

            {/* Create dialog */}
            <CheckpointDialog
                companyEmployees={availableEmployees}
                open={isCreateDialogOpened}
                onClose={onCloseCreateDialog}
                onSave={handleCreateCheckpoint}
            />

            {/* Update dialog */}
            {targetForEdit && (
                <CheckpointDialog
                    origin={targetForEdit}
                    companyEmployees={availableEmployees}
                    open={!!targetForEdit}
                    onClose={() => setTargetForEdit(null)}
                    onSave={handleUpdateCheckpoint}
                />
            )}

            {/* Confirm delete dialog */}
            <ConfirmDeleteDialog
                open={!!targetIdForRemove}
                onCLose={() => setTargetIdForRemove(null)}
                onConfirm={handleDeleteCheckpoint}
            />

            {/* Update Time Dialog (NEW) */}
            <SessionUpdateTimeDialog
                open={isTimeDialogOpen}
                onClose={onCloseTimeDialog}
                currentStartTime={session.startWorkTime}
                onSave={handleUpdateSessionTime}
                isLoading={isLoading}
            />

            {/* Close Session Dialog (NEW) */}
            <SessionCloseDialog
                open={isCloseSessionDialogOpen}
                onClose={onCloseCloseSessionDialog}
                onConfirm={handleCloseSession}
                isLoading={isLoading}
            />
        </Container>
    );
}

export default CalcInShiftPage;
