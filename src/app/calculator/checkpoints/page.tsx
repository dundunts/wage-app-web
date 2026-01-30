"use client";

import React, {useEffect, useState} from 'react';
import {
    Button,
    Container,
    Flex,
    Heading,
    HStack,
    IconButton,
    Spinner,
    Stack,
    Text,
    useDisclosure
} from "@chakra-ui/react";
import {Calculator, Plus} from "lucide-react";
import {ShiftCheckpointCard} from "@/components/shift/shift.checkpoint.components.card";
import {CheckpointDialog} from "@/components/shift/shift.checkpoint.components.dialog";
import ConfirmDeleteDialog from "@/components/dialog/components.dialog.confirmation.delete";
import {useRouter, useSearchParams} from "next/navigation";
import {getAvailableSession} from "@/service/session/session.service";
import {Session} from "@/types/session.types";
import {
    Checkpoint,
    CheckpointPayload,
    CreateRegularCheckpointPayload,
    UpdateShiftCheckpointPayload
} from "@/types/checkpoint.types";
import {createCheckpoint, deleteCheckpoint, updateCheckpoint} from "@/service/checpoint/checkpoint.service";
import {CompanyEmployeeInfo} from "@/types/employee.types";
import {getAvailableEmployeesForCompany} from "@/service/employee/employee.service";

export function CalcInShiftPage() {
    const searchParams = useSearchParams();

    const sessionId = searchParams.get("sessionId");

    const router = useRouter()

    const [isLoading, setLoading] = useState(true)

    const [error, setError] = useState("")

    const [session, setSession] = useState<Session | undefined>(undefined)

    const [availableEmployees, setAvailableEmployees] = useState<CompanyEmployeeInfo[]>([])

    const {open: isCreateDialogOpened, onOpen: onOpenCreateDialog, onClose: onCloseCreateDialog} = useDisclosure()

    const [targetIdForRemove, setTargetIdForRemove] = useState<string | null>()
    const [targetForEdit, setTargetForEdit] = useState<Checkpoint | null>()

    useEffect(() => {
        loadData()
    }, []);

    async function loadData() {
        if (!sessionId) return;

        setLoading(true)

        try {
            const session = await getAvailableSession(sessionId)

            if (session.status === "OPENED_DRAFT" || session.status === "RECALCULATING_DRAFT") {
                router.push(`/calculator/draft?sessionId=${sessionId}`)
                return;
            }

            const availableEmployees = await getAvailableEmployeesForCompany(session.companyId)

            setSession(session)
            setAvailableEmployees(availableEmployees)
        } catch (e) {
            setError("Fail to load data")
        } finally {
            setLoading(false)
        }
    }

    function handleCreateCheckpoint(payload: CheckpointPayload) {
        if (!session) return;

        setLoading(true)

        const createPayload: CreateRegularCheckpointPayload = {
            ...payload,
            sessionId: session.id
        }

        createCheckpoint(createPayload)
            .then(() => {
                loadData()
                onCloseCreateDialog()
            })
            .finally(() => setLoading(false))
    }

    function handleUpdateCheckpoint(payload: CheckpointPayload) {
        if (!targetForEdit) return;

        setLoading(true)

        const updatePayload: UpdateShiftCheckpointPayload = {
            ...payload,
            id: targetForEdit.id
        }

        updateCheckpoint(updatePayload)
            .then(() => {
                loadData()
                setTargetForEdit(null)
            })
            .finally(() => setLoading(false))
    }

    function handleDeleteCheckpoint() {
        if (!targetIdForRemove) return;

        setLoading(true)

        deleteCheckpoint(targetIdForRemove)
            .then(() => {
                loadData()
                setTargetIdForRemove(null)
            })
            .finally(() => setLoading(false))
    }

    function handleGoToResults() {
        router.push(`/calculator/draft?sessionId=${sessionId}`)
    }

    if (isLoading) return (
        <Stack align="center" py={10}>
            <Spinner />
        </Stack>
    );

    if (error) return (
        <Stack py={6}>
            <Text color="red.500">{error}</Text>
        </Stack>
    );

    if (!session) return;

    const {checkpoints} = session

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
                        {/* Date selector */}
                        <HStack>
                            <Text fontSize="sm" color="fg.muted">
                                Начало смены:
                            </Text>

                            {/*TODO вынести в модальное окно*/}
                            {/*<DateTimePicker*/}
                            {/*    value={session.date}*/}
                            {/*    onChange={() => {}}*/}
                            {/*/>*/}
                        </HStack>

                        <Button colorPalette="teal" onClick={handleGoToResults}
                                disabled={checkpoints.length <= 0}>
                            <Calculator/> К результатам
                        </Button>
                </Flex>

                <Stack gap={4} direction="column-reverse">
                        {checkpoints.map((checkpoint, index) => (
                            <ShiftCheckpointCard
                                key={checkpoint.id}
                                checkpoint={checkpoint}
                                position={index + 1}
                                onDeleteRequested={() => setTargetIdForRemove(checkpoint.id)}
                                onEdit={() => setTargetForEdit(checkpoint)}
                                // onMoveUp={() => moveUp(index)}
                                // onMoveDown={() => moveDown(index)}
                            />
                        ))}

                        {checkpoints.length === 0 && (
                            <Text color="fg.muted">
                                Чекпоинты ещё не добавлены
                            </Text>
                        )}
                    </Stack>
            </Stack>

            {/* Floating Action Button */}
                <IconButton
                    aria-label="Add checkpoint"
                    position="fixed"
                    bottom={6}
                    right={6}
                    size="lg"
                    colorPalette="teal"
                    borderRadius="full"
                    boxShadow="lg"
                    onClick={onOpenCreateDialog}
                >
                    <Plus/>
                </IconButton>

            {/* Create dialog */}
            <CheckpointDialog companyEmployees={availableEmployees}
                              open={isCreateDialogOpened}
                              onClose={onCloseCreateDialog}
                              onSave={handleCreateCheckpoint}/>

            {/* Update dialog */}
            {targetForEdit &&
                <CheckpointDialog origin={targetForEdit}
                                  companyEmployees={availableEmployees}
                                  open={!!targetForEdit}
                                  onClose={() => setTargetForEdit(null)}
                                  onSave={handleUpdateCheckpoint}/>
            }

            {/* Confirm delete dialog */}
            <ConfirmDeleteDialog open={!!targetIdForRemove} onCLose={() => setTargetIdForRemove(null)}
                                 onConfirm={handleDeleteCheckpoint}/>
        </Container>
    );
}

export default CalcInShiftPage;