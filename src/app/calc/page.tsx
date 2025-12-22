"use client";

import React, {useState} from 'react';
import {Box, Button, Container, Flex, Heading, HStack, IconButton, Stack, Text, useDisclosure} from "@chakra-ui/react";
import {ArrowLeft, Calculator, Check, Plus, Save, Undo2} from "lucide-react";
import {checkpointList} from "@/stub/shift.checkpoint.stub";
import {ShiftCheckpoint, ShiftCheckpointPayload} from "@/types/shift.types";
import {ShiftCheckpointCard} from "@/components/shift/shift.checkpoint.components.card";
import {CheckpointDialog} from "@/components/shift/shift.checkpoint.components.dialog";
import {companyEmployees} from "@/stub/employee.stub";
import {Company} from "@/types/company.types";
import {mainCompanyStub} from "@/stub/company.stab";
import {EmployeePaymentDraftCard, ShiftResultsDraftTable} from "@/components/shift/shift.results.draft.components";
import {DateTimePicker} from "@/components/date/components.date.pickers";
import {calculateResults} from "@/components/shift/shift.results.draft.functions";
import {ShiftResultsDraft} from "@/types/shift.results.draft.types";
import ConfirmDeleteDialog from "@/components/dialog/components.dialog.confirmation.delete";

import {getShiftDate} from "@/app/calc/shift.functions";

export function CalcInShiftPage() {
    //TODO remove mock
    const checkpointFromRemote = checkpointList
    //TODO remove mock
    const company: Company = mainCompanyStub

    const [stageState, setStageState] = useState<"checkpoints" | "result">("checkpoints")

    const [resultsDraft, setResultsDraft] = useState<ShiftResultsDraft>({payments: []})

    const [date, setDate] = useState<Date>(getShiftDate(company.defaultShiftStartTime));
    const [checkpoints, setCheckpoints] = useState<ShiftCheckpoint[]>(checkpointFromRemote);
    const {open: isCreateDialogOpened, onOpen: onOpenCreateDialog, onClose: onCloseCreateDialog} = useDisclosure()
    const [isDirty, setDirty] = useState(false)

    const [targetIdForRemove, setTargetIdForRemove] = useState<string | null>()
    const [targetForEdit, setTargetForEdit] = useState<ShiftCheckpoint | null>()

    // function moveUp(checkPointIdx: number) {
    //     if (checkPointIdx >= checkpoints.length - 1) return;
    //     setDirty(true)
    //     const newArr = [...checkpoints]
    //     newArr[checkPointIdx] = checkpoints[checkPointIdx + 1]
    //     newArr[checkPointIdx + 1] = checkpoints[checkPointIdx]
    //     setCheckpoints(newArr)
    // }
    //
    // function moveDown(checkPointIdx: number) {
    //     if (checkPointIdx <= 0) return;
    //     setDirty(true)
    //     const newArr = [...checkpoints]
    //     newArr[checkPointIdx] = checkpoints[checkPointIdx - 1]
    //     newArr[checkPointIdx - 1] = checkpoints[checkPointIdx]
    //     setCheckpoints(newArr)
    // }

    function handleCreateCheckpoint(payload: ShiftCheckpointPayload) {
        //TODO calling API
        const instant = new Date()

        //TODO insert by date
        setCheckpoints([
            ...checkpoints,
            {
                id: payload.dateTime.toLocaleString(),
                revenue: payload.revenue,
                tips: payload.tips,
                employees: payload.employees,
                type: payload.type,
                fieldRecords: payload.fieldRecords.map(f => ({...f, id: f.label})),
                dateTime: payload.dateTime,
                createdAt: instant,
                creatorUserId: "someId",
                updateAt: instant,
                updaterUserId: "someId"
            }
        ])

        onCloseCreateDialog()
    }

    function handleUpdateCheckpoint(payload: ShiftCheckpointPayload) {
        //TODO calling API
        const instant = new Date()

        //TODO insert by date
        setCheckpoints(checkpoints.map(el => el.id === targetForEdit?.id ? {
            ...targetForEdit,
            id: targetForEdit.id,
            revenue: payload.revenue,
            tips: payload.tips,
            employees: payload.employees,
            type: payload.type,
            fieldRecords: payload.fieldRecords.map(f => ({...f, id: f.label})),
            dateTime: payload.dateTime,
            updateAt: instant,
            updaterUserId: "someId"
        } : el))

        setTargetForEdit(null)
    }

    function handleDeleteCheckpoint() {
        if (!targetIdForRemove) return;
        //TODO calling API
        setCheckpoints(checkpoints.filter(el => el.id !== targetIdForRemove))
        setTargetIdForRemove(null)
    }

    function handleRevertChanges() {
        setCheckpoints(checkpointFromRemote)
        setDirty(false)
    }

    function handleSaveChanges() {
        //TODO calling API
    }

    function handleGoToResults() {
        const results = calculateResults(checkpoints, company, date, isDirty)
        if (results) {
            setResultsDraft(results)
            setStageState("result")
        }
    }

    function handleBackToCheckpoints() {
        setStageState("checkpoints")
        setResultsDraft({payments: []})
    }

    function handleAcceptResults() {
        //TODO calling API
        //TODO go to saved ShiftResult?
    }

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
                    {stageState === "checkpoints"
                        ? <>
                            {/* Date selector */}
                            <HStack>
                                <Text fontSize="sm" color="fg.muted">
                                    Начало смены:
                                </Text>

                                <DateTimePicker
                                    value={date}
                                    onChange={setDate}
                                />
                            </HStack>

                            {isDirty
                                ? <Stack direction={{base: "column", md: "row"}}>
                                    <Button variant="outline" onClick={handleRevertChanges}>
                                        <Undo2/> Откатить изменения
                                    </Button>
                                    <Button colorPalette="teal" onClick={handleSaveChanges}>
                                        <Save/> Сохранить изменения
                                    </Button>
                                </Stack>
                                : <Button colorPalette="teal" onClick={handleGoToResults}
                                          disabled={checkpoints.length <= 0}>
                                    <Calculator/> К результатам
                                </Button>
                            }
                        </>
                        : <>
                            <Text fontSize="sm" color="fg.muted">
                                Начало смены: {date.toLocaleString()}
                            </Text>

                            <Stack direction={{base: "column", md: "row"}}>
                                <Button variant="outline" onClick={handleBackToCheckpoints}>
                                    <ArrowLeft/> Назад
                                </Button>
                                <Button colorPalette="teal" onClick={handleAcceptResults}>
                                    <Check/> Завершить смену
                                </Button>
                            </Stack>
                        </>
                    }

                </Flex>

                {stageState === "checkpoints"
                    ? <Stack gap={4} direction="column-reverse">
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
                    : <Stack gap={4}>
                        {resultsDraft.payments.length === 0 && (
                            <Text color="fg.muted">
                                Нет данных для расчёта
                            </Text>
                        )}

                        {/* Desktop table */}
                        <Box display={{base: "none", md: "block"}}>
                            <ShiftResultsDraftTable resultsDraft={resultsDraft}/>
                        </Box>

                        {/* Mobile cards */}
                        <Stack gap={3} display={{base: "flex", md: "none"}}>
                            {resultsDraft.payments.map((p) =>
                                <EmployeePaymentDraftCard key={p.employee.id} payment={p}/>
                            )}
                        </Stack>
                    </Stack>
                }

            </Stack>

            {/* Floating Action Button */}
            {stageState === "checkpoints" && (
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
            )}

            {/* Create dialog */}
            <CheckpointDialog companyEmployees={companyEmployees}
                              open={isCreateDialogOpened}
                              onClose={onCloseCreateDialog}
                              onSave={handleCreateCheckpoint}/>

            {/* Update dialog */}
            {targetForEdit &&
                <CheckpointDialog origin={targetForEdit}
                                  companyEmployees={companyEmployees}
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