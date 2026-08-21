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
    Portal,
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
    const employeesLabelId = React.useId();

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

    const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
        event.preventDefault();
        handleSave();
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
                    setEmployeesSelectError(false);
                } else if (!pending) {
                    onClose();
                }
            }}
        >
            <Portal>
                <Dialog.Backdrop/>
                <Dialog.Positioner p={{base: 3, sm: 4}}>
                <Dialog.Content
                    as="form"
                    onSubmit={handleSubmit}
                    maxW="500px"
                    maxH="calc(100dvh - 2rem)"
                >
                    <Dialog.Header>
                        <Dialog.Title>
                            {origin ? "Редактирование чекпоинта" : "Создание чекпоинта"}
                        </Dialog.Title>
                    </Dialog.Header>

                    <Dialog.Body overflowY="auto">
                        <Stack gap={5}>
                            {/* Form type switch */}
                            <SegmentGroup.Root
                                maxWidth="max-content"
                                orientation="horizontal"
                                value={formType}
                                disabled={pending}
                                colorPalette="brand"
                                aria-label="Тип чекпоинта"
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
                                    <Field.Root
                                        key={field.label}
                                        display="grid"
                                        gridTemplateColumns={{base: "1fr", sm: "1fr 140px"}}
                                        alignItems={{sm: "center"}}
                                        gap={2}
                                    >
                                        <Field.Label flex="1">{field.label}</Field.Label>
                                        <Input
                                            type="number"
                                            disabled={pending}
                                            value={values[field.label] ?? 0}
                                            onChange={(e) =>
                                                setValues((prev) => ({
                                                    ...prev,
                                                    [field.label]: Number(e.target.value),
                                                }))
                                            }
                                            w={{base: "full", sm: "140px"}}
                                        />
                                    </Field.Root>
                                ))}
                            </VStack>

                            {/* Employees */}
                            <Box role="group" aria-labelledby={employeesLabelId}>
                                <Text id={employeesLabelId} fontSize="sm" mb={2} color="fg.muted">
                                    Сотрудники
                                </Text>
                                <Grid templateColumns={{sm: "repeat(2, 1fr)"}} gap={2}>
                                    <For each={companyEmployees}>
                                        {(emp) => (
                                            <CheckboxCard.Root
                                                checked={selectedEmployees.some(e => e.id === emp.id)}
                                                onCheckedChange={(e) => pickEmployee(e, emp)}
                                                key={emp.id}
                                                colorPalette="brand"
                                                disabled={pending}
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
                                {employeesSelectError && (
                                    <Text role="alert" mt={2} fontSize="sm" color="status.danger">
                                        Выберите хотя бы одного сотрудника
                                    </Text>
                                )}
                            </Box>

                            {/* Date */}
                            <Box>
                                <Field.Root>
                                    <Field.Label>Дата и время чекпоинта</Field.Label>
                                    <Input
                                        type="datetime-local"
                                        colorScheme="light dark"
                                        disabled={pending}
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
                                borderRadius="control"
                                bg="bg.subtle"
                                borderWidth="1px"
                                borderColor="border.muted"
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
                        <Stack
                            direction={{base: "column-reverse", sm: "row"}}
                            justify="flex-end"
                            w="full"
                        >
                            <Button variant="subtle" disabled={pending} onClick={onClose} w={{base: "full", sm: "auto"}}>
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                colorPalette="brand"
                                loading={pending}
                                loadingText={pendingLabel}
                                disabled={pending}
                                w={{base: "full", sm: "auto"}}
                            >
                                Сохранить
                            </Button>
                        </Stack>
                    </Dialog.Footer>
                </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}
