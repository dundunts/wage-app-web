"use client";

import {
    Box,
    Button,
    CheckboxCard,
    Dialog,
    Field,
    For,
    Grid,
    HStack,
    Input,
    SegmentGroup,
    Stack,
    Text,
    VStack,
} from "@chakra-ui/react";
import React, {useMemo, useState} from "react";
import {CompanyEmployeeInfo, EmployeeBase} from "@/types/employee.types";
import {CheckedChangeDetails} from "@zag-js/checkbox";
import {checkpointDialogForms} from "@/components/shift/shift.checkpoint.components.dialog.constants";
import {
    Checkpoint,
    CheckpointCalcDestination,
    CheckpointMetricRecordPayload,
    CheckpointPayload,
    CheckpointType
} from "@/types/checkpoint.types";
import {toLocalDateTimeInputValue} from "@/utils/date.utils";

type CreateCheckpointDialogProps = {
    origin?: Checkpoint;
    initialFormType?: CheckpointType;
    companyEmployees: CompanyEmployeeInfo[];
    prevCheckpoint?: Checkpoint;
    open: boolean;
    pending: boolean;
    pendingLabel: string;
    onClose: () => void;
    onSave: (payload: CheckpointPayload) => void;
}

function getInitialValues(origin?: Checkpoint) {
    return origin?.metricRecords.reduce((acc, item) =>
        ({...acc, [item.label]: item.value}), {}) || {};
}

function getInitialEmployees(origin?: Checkpoint, prevCheckpoint?: Checkpoint) {
    return origin?.employees || prevCheckpoint?.employees || [];
}

function getInitialDate(origin?: Checkpoint): Date {
    return origin?.dateTime ? new Date(origin.dateTime) : new Date()
}

export function CheckpointDialog(
    {
        origin,
        initialFormType = origin?.type || CheckpointType.REGULAR,
        companyEmployees,
        prevCheckpoint,
        open,
        pending,
        pendingLabel,
        onClose,
        onSave,
    }: CreateCheckpointDialogProps
) {
    const [formType, setFormType] =
        useState<CheckpointType>(initialFormType);

    const [values, setValues] = useState<Record<string, number>>(getInitialValues(origin));
    const [selectedEmployees, setSelectedEmployees] = useState<EmployeeBase[]>(getInitialEmployees(origin, prevCheckpoint));
    const [date, setDate] = useState<Date>(getInitialDate(origin));
    // const [date, setDate] = useState<Date>(new Date());

    const [employeesSelectError, setEmployeesSelectError] = useState(false)

    const form = checkpointDialogForms[formType];

    const {revenue, tips} = useMemo(() => {
        return form.fields.reduce(
            (acc, field) => {
                const value = values[field.label] ?? 0;

                if (field.destination === CheckpointCalcDestination.REVENUE) {
                    acc.revenue += value;
                }
                if (field.destination === CheckpointCalcDestination.TIPS) {
                    acc.tips += value;
                }

                return acc;
            },
            {revenue: 0, tips: 0}
        );
    }, [values, form]);

    const handleSave = () => {
        if (selectedEmployees.length === 0) {
            setEmployeesSelectError(true)
            return
        }

        const payload: CheckpointPayload = {
            revenue,
            tips,
            employeeIds: selectedEmployees.map(e => e.id),
            dateTime: date,
            type: formType,
            fieldRecords: form.fields.map(f =>
                ({...f, value: values[f.label]} as CheckpointMetricRecordPayload)),
        }

        onSave(payload);
    };

    function pickEmployee(e: CheckedChangeDetails, emp: EmployeeBase) {
        setEmployeesSelectError(false)
        if (e.checked) setSelectedEmployees([...selectedEmployees, emp])
        else setSelectedEmployees(selectedEmployees.filter(el => el.id !== emp.id))
    }

    return (
        <Dialog.Root
            open={open}
            closeOnEscape={!pending}
            closeOnInteractOutside={!pending}
            onOpenChange={(details) => {
                if (details.open) {
                    setFormType(initialFormType);
                    setValues(getInitialValues(origin));
                    setSelectedEmployees(getInitialEmployees(origin, prevCheckpoint));
                    setDate(getInitialDate(origin));
                } else if (!pending) {
                    onClose();
                }
            }}
        >
            <Dialog.Backdrop/>

            <Dialog.Positioner>
                <Dialog.Content maxW="500px">
                    <Dialog.Header>
                        <Dialog.Title>Создание чекпоинта</Dialog.Title>
                    </Dialog.Header>

                    <Dialog.Body>
                        <Stack gap={5}>
                            {/* Form type switch */}
                            <SegmentGroup.Root
                                maxWidth="max-content"
                                orientation="horizontal"
                                value={formType}
                                onValueChange={(e) => setFormType(CheckpointType[e.value as keyof typeof CheckpointType])}
                            >
                                <SegmentGroup.Indicator/>
                                {Object.values(CheckpointType).map((item) => (
                                    <SegmentGroup.Item key={item} value={item}>
                                        <SegmentGroup.ItemText>{checkpointDialogForms[item].label}</SegmentGroup.ItemText>
                                        <SegmentGroup.ItemHiddenInput/>
                                    </SegmentGroup.Item>
                                ))}
                            </SegmentGroup.Root>

                            {/* Form fields */}
                            <VStack align="stretch" gap={3}>
                                {form.fields.map((field) => (
                                    <HStack key={field.label} justify="space-between">
                                        <Text>{field.label}</Text>
                                        <Input
                                            type="number"
                                            value={values[field.label] ?? 0}
                                            onChange={(e) =>
                                                setValues((prev) => ({
                                                    ...prev,
                                                    [field.label]: Number(e.target.value),
                                                }))
                                            }
                                            w="140px"
                                        />
                                    </HStack>
                                ))}
                            </VStack>

                            {/* Employees */}
                            <Box>
                                <Text fontSize="sm" mb={2} color="fg.muted">
                                    Сотрудники
                                </Text>
                                <Grid templateColumns={{sm: "repeat(2, 1fr)"}} gap={2}>
                                    <For each={companyEmployees}>
                                        {(emp) => (
                                            <CheckboxCard.Root
                                                checked={selectedEmployees.some(e => e.id === emp.id)}
                                                onCheckedChange={(e) => pickEmployee(e, emp)}
                                                key={emp.id}
                                                colorPalette="teal"
                                                invalid={employeesSelectError}
                                            >
                                                <CheckboxCard.HiddenInput/>
                                                <CheckboxCard.Control>
                                                    <CheckboxCard.Label>{emp.simpleName || `${emp.lastName} ${emp.firstName[0]}.`}</CheckboxCard.Label>
                                                    <CheckboxCard.Indicator/>
                                                </CheckboxCard.Control>
                                            </CheckboxCard.Root>
                                        )}
                                    </For>
                                </Grid>
                            </Box>

                            {/* Date */}
                            <Box>
                                <Text fontSize="sm" mb={2} color="fg.muted">
                                    Дата и время
                                </Text>
                                <Field.Root>
                                    <Field.Label>Время начала (ЧЧ:ММ)</Field.Label>
                                    <Input
                                        type="datetime-local"
                                        size="lg"
                                        value={toLocalDateTimeInputValue(date)}
                                        onChange={e => {
                                            setDate(new Date(e.target.value))
                                        }}
                                    />
                                </Field.Root>
                            </Box>

                            {/* Preview */}
                            <Box
                                p={3}
                                borderRadius="md"
                                bg="bg.subtle"
                            >
                                <HStack justify="space-between">
                                    <Text>Выручка</Text>
                                    <Text fontWeight="medium">
                                        {revenue.toLocaleString()} ₽
                                    </Text>
                                </HStack>
                                <HStack justify="space-between">
                                    <Text>Чаевые</Text>
                                    <Text fontWeight="medium">
                                        {tips.toLocaleString()} ₽
                                    </Text>
                                </HStack>
                            </Box>
                        </Stack>
                    </Dialog.Body>

                    <Dialog.Footer>
                        <HStack justify="flex-end">
                            <Button variant="subtle" disabled={pending} onClick={onClose}>
                                Отмена
                            </Button>
                            <Button
                                colorPalette="teal"
                                loading={pending}
                                loadingText={pendingLabel}
                                disabled={pending}
                                onClick={handleSave}
                            >
                                Сохранить
                            </Button>
                        </HStack>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}
