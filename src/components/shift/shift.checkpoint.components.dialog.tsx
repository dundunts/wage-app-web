"use client";

import {
    Box,
    Button,
    CheckboxCard,
    Dialog,
    For,
    Grid,
    HStack,
    Input,
    SegmentGroup,
    Stack,
    Text,
    VStack,
} from "@chakra-ui/react";
import {useMemo, useState} from "react";
import {Employee} from "@/types/employee.types";
import {
    CalcCheckpointFormType,
    CheckpointCalcDestination, CheckpointFormFieldRecord,
    ShiftCheckpointPayload,
    ShiftCheckpoint
} from "@/types/shift.types";
import {CheckedChangeDetails} from "@zag-js/checkbox";
import {DateTimePicker} from "@/components/date/components.date.pickers";
import {checkpointDialogForms} from "@/components/shift/shift.checkpoint.components.dialog.constants";

type CreateCheckpointDialogProps = {
    origin?: ShiftCheckpoint;
    initialFormType?: CalcCheckpointFormType;
    companyEmployees: Employee[];
    prevCheckpoint?: ShiftCheckpoint;
    open: boolean;
    onClose: () => void;
    onSave: (payload: ShiftCheckpointPayload) => void;
}

function getInitialValues(origin?: ShiftCheckpoint) {
    return origin?.fieldRecords.reduce((acc, item) =>
        ({...acc, [item.label]: item.value}), {}) || {};
}

function getInitialEmployees(origin?: ShiftCheckpoint, prevCheckpoint?: ShiftCheckpoint) {
    return origin?.employees || prevCheckpoint?.employees || [];
}

function getInitialDate(origin?: ShiftCheckpoint) {
    return origin?.dateTime || new Date()
}

export function CheckpointDialog(
    {
        origin,
        initialFormType = origin?.type || CalcCheckpointFormType.REGULAR,
        companyEmployees,
        prevCheckpoint,
        open,
        onClose,
        onSave,
    }: CreateCheckpointDialogProps
) {
    const [formType, setFormType] =
        useState<CalcCheckpointFormType>(initialFormType);

    const [values, setValues] = useState<Record<string, number>>(getInitialValues(origin));
    const [selectedEmployees, setSelectedEmployees] = useState<Employee[]>(getInitialEmployees(origin, prevCheckpoint));
    const [date, setDate] = useState<Date>(getInitialDate(origin));

    const [employeesSelectError, setEmployeesSelectError] = useState(false)

    const form = checkpointDialogForms[formType];

    console.log("Edit dialog. Origin", origin)
    console.log("Edit dialog. Selected employees", selectedEmployees)
    console.log("Edit dialog. Values", values)

    const {revenue, tips} = useMemo(() => {
        return form.fields.reduce(
            (acc, field, index) => {
                const value = values[index] ?? 0;

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

    const handleCreate = () => {
        if (selectedEmployees.length === 0) {
            setEmployeesSelectError(true)
            return
        }

        onSave({
            revenue,
            tips,
            employees: selectedEmployees,
            dateTime: date,
            type: formType,
            fieldRecords: form.fields.map(f =>
                ({...f, value: values[f.label]} as CheckpointFormFieldRecord)),
        });
    };

    function pickEmployee(e: CheckedChangeDetails, emp: Employee) {
        setEmployeesSelectError(false)
        if (e.checked) setSelectedEmployees([...selectedEmployees, emp])
        else setSelectedEmployees(selectedEmployees.filter(el => el.id !== emp.id))
    }

    return (
        <Dialog.Root
            open={open}
            onOpenChange={(details) => {
                if (details.open) {
                    //TODO debug setup initial values
                    setFormType(initialFormType);
                    setValues(getInitialValues(origin));
                    setSelectedEmployees(getInitialEmployees(origin, prevCheckpoint));
                    setDate(getInitialDate(origin));
                } else {
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
                                onValueChange={(e) => setFormType(CalcCheckpointFormType[e.value as keyof typeof CalcCheckpointFormType])}
                            >
                                <SegmentGroup.Indicator/>
                                {Object.values(CalcCheckpointFormType).map((item) => (
                                    <SegmentGroup.Item key={item} value={item}>
                                        <SegmentGroup.ItemText>{checkpointDialogForms[item].label}</SegmentGroup.ItemText>
                                        <SegmentGroup.ItemHiddenInput/>
                                    </SegmentGroup.Item>
                                ))}
                            </SegmentGroup.Root>

                            {/* Form fields */}
                            <VStack align="stretch" gap={3}>
                                {form.fields.map((field, index) => (
                                    <HStack key={field.label} justify="space-between">
                                        <Text>{field.label}</Text>
                                        <Input
                                            type="number"
                                            value={values[index] ?? 0}
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
                                                    <CheckboxCard.Label>{emp.simpleName}</CheckboxCard.Label>
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
                                <DateTimePicker value={date} onChange={setDate}/>
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
                            <Button variant="ghost" onClick={onClose}>
                                Отмена
                            </Button>
                            <Button colorPalette="teal" onClick={handleCreate}>
                                Сохранить
                            </Button>
                        </HStack>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}
