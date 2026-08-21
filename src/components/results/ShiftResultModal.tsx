// @/app/results/_components/ShiftResultModal.tsx
"use client";

import {useEffect, useMemo, useState} from "react";
import {Controller, useFieldArray, useForm} from "react-hook-form";
import {
    Box,
    Button,
    createListCollection,
    Dialog,
    Field as ChakraField,
    Flex,
    Grid,
    IconButton,
    Input,
    Select,
    Spinner,
    Stack,
    Text,
} from "@chakra-ui/react";
import {HiPlus, HiTrash} from "react-icons/hi";
import {Company} from "@/types/company.types";
import {CompanyEmployeeInfo} from "@/types/employee.types";
import {SaveShiftResultPayload, ShiftResultDetailed} from "@/types/shiftResult.types";
import {employeeService} from "@/service/employee/employee.service";
import {shiftResultService} from "@/service/results/shiftResult.service"; // Проверь путь импорта
import {feedback} from "@/feedback/feedback";
import {Field} from "@/components/ui/field";
import {feedbackMessages} from "@/feedback/messages";

interface InitialData {
    result: ShiftResultDetailed;
    companyId: string;
}

interface ShiftResultModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSuccess: () => void;
    companies: Company[];
    initialData?: InitialData | null;
}

interface FormValues {
    companyId: string;
    date: string;
    payments: {
        employeeId: string;
        percentFromRevenue: number;
        tips: number;
        workHours: number;
    }[];
}

export function ShiftResultModal({
                                     isOpen,
                                     onClose,
                                     onSuccess,
                                     companies,
                                     initialData,
                                 }: ShiftResultModalProps) {
    const [employees, setEmployees] = useState<CompanyEmployeeInfo[]>([]);
    const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);
    const [isSubmitting, setIsSubmitting] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        watch,
        reset,
        formState: {errors},
    } = useForm<FormValues>({
        defaultValues: {
            companyId: "",
            date: new Date().toISOString().split("T")[0],
            payments: [],
        },
    });

    const { fields, append, remove } = useFieldArray({
        control,
        name: "payments",
    });

    const selectedCompanyId = watch("companyId");

    // === Подготовка коллекций для Chakra UI Select ===

    // Коллекция компаний
    const companyCollection = useMemo(() => {
        return createListCollection({
            items: companies,
            itemToString: (item) => item.title,
            itemToValue: (item) => item.id,
        });
    }, [companies]);

    // Коллекция сотрудников (динамическая)
    const employeeCollection = useMemo(() => {
        return createListCollection({
            items: employees.map(e => ({
                label: `${e.lastName} ${e.firstName}`,
                value: e.id
            })),
        });
    }, [employees]);

    // 1. Инициализация формы
    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                const { result, companyId } = initialData;
                reset({
                    companyId: companyId,
                    date: new Date(result.date).toISOString().split("T")[0],
                    payments: result.payments.map((p) => ({
                        employeeId: p.employee.id,
                        percentFromRevenue: p.percentFromRevenue,
                        tips: p.tips,
                        workHours: Number((p.workSeconds / 3600).toFixed(2)),
                    })),
                });
            } else {
                reset({
                    companyId: companies[0]?.id || "",
                    date: new Date().toISOString().split("T")[0],
                    payments: [],
                });
            }
        }
    }, [isOpen, initialData, companies, reset]);

    // 2. Загрузка сотрудников
    useEffect(() => {
        if (!selectedCompanyId) {
            setEmployees([]);
            return;
        }

        setIsEmployeesLoading(true);
        employeeService.getCoworkersForCompany(selectedCompanyId)
            .then(setEmployees)
            .catch((e) => {
                feedback.beginAction("shiftResultEmployeesLoad").error(e);
            })
            .finally(() => setIsEmployeesLoading(false));
    }, [selectedCompanyId]);

    const onSubmit = async (data: FormValues) => {
        setIsSubmitting(true);
        const actionFeedback = feedback.beginAction("shiftResultSave");
        try {
            const payload: SaveShiftResultPayload = {
                companyId: data.companyId,
                overwrite: !!initialData,
                date: new Date(data.date),
                payments: data.payments.map((p) => ({
                    employeeId: p.employeeId,
                    percentFromRevenue: Number(p.percentFromRevenue),
                    tips: Number(p.tips),
                    workSeconds: Math.round(p.workHours * 3600),
                })),
            };

            await shiftResultService.save(payload);
            actionFeedback.success();
            onSuccess();
            onClose();
        } catch (error) {
            actionFeedback.error(error);
        } finally {
            setIsSubmitting(false);
        }
    };

    return (
        <Dialog.Root
            open={isOpen}
            closeOnEscape={!isSubmitting}
            closeOnInteractOutside={!isSubmitting}
            onOpenChange={(details) => !details.open && !isSubmitting && onClose()}
            size="xl"
            scrollBehavior="inside" // Важно для длинных списков, чтобы модалка скроллилась внутри
        >
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content>
                    <form noValidate onSubmit={handleSubmit(onSubmit)}>
                        <Dialog.Header>
                            <Dialog.Title>
                                {initialData ? "Редактировать результат" : "Создать результат смены"}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Stack gap={5}>
                                {/* Верхняя панель: Компания и Дата */}
                                <Flex gap={4} direction={{ base: "column", sm: "row" }}>
                                    <Box flex={1}>
                                        <Text fontSize="sm" mb={1} fontWeight="medium">Компания</Text>
                                        <Controller
                                            control={control}
                                            name="companyId"
                                            render={({ field }) => (
                                                <Select.Root
                                                    collection={companyCollection}
                                                    value={field.value ? [field.value] : []}
                                                    onValueChange={(e) => field.onChange(e.value[0])}
                                                    disabled={!!initialData} // Не меняем компанию при редактировании
                                                    width="100%"
                                                >
                                                    <Select.Trigger>
                                                        <Select.ValueText placeholder="Выберите компанию" />
                                                    </Select.Trigger>
                                                    <Select.Positioner>
                                                        <Select.Content>
                                                            {companyCollection.items.map((company) => (
                                                                <Select.Item item={company} key={company.id}>
                                                                    {company.title}
                                                                </Select.Item>
                                                            ))}
                                                        </Select.Content>
                                                    </Select.Positioner>
                                                </Select.Root>
                                            )}
                                        />
                                    </Box>

                                    <Field
                                        flex={1}
                                        label="Дата"
                                        required
                                        invalid={!!errors.date}
                                        errorText={errors.date?.message}
                                    >
                                        <Input
                                            type="date"
                                            {...register("date", {required: "Укажите дату"})}
                                        />
                                    </Field>
                                </Flex>

                                <hr />

                                {/* Список выплат */}
                                <Box>
                                    <Flex justify="space-between" align="center" mb={2}>
                                        <Text fontWeight="bold">Список выплат</Text>
                                        <Button
                                            size="sm"
                                            variant="outline"
                                            onClick={() => append({ employeeId: "", percentFromRevenue: 0, tips: 0, workHours: 0 })}
                                        >
                                            <HiPlus /> Добавить
                                        </Button>
                                    </Flex>

                                    {/* Заголовки таблицы */}
                                    {fields.length > 0 && (
                                        <Grid templateColumns="2fr 1fr 1fr 1fr auto" gap={2} mb={2} px={1}>
                                            <Text fontSize="xs" color="gray.500">Сотрудник</Text>
                                            <Text fontSize="xs" color="gray.500">% от выр.</Text>
                                            <Text fontSize="xs" color="gray.500">Чаевые</Text>
                                            <Text fontSize="xs" color="gray.500">Часы</Text>
                                            <Box w="32px" />
                                        </Grid>
                                    )}

                                    <Stack gap={2}>
                                        {fields.map((field, index) => (
                                            <Grid
                                                key={field.id}
                                                templateColumns="2fr 1fr 1fr 1fr auto"
                                                gap={2}
                                                alignItems="start" // Changed to start so errors don't misalign grid if added later
                                            >
                                                {/* Выбор сотрудника (Chakra UI Select + Controller) */}
                                                <ChakraField.Root
                                                    required
                                                    invalid={!!errors.payments?.[index]?.employeeId}
                                                >
                                                    <ChakraField.Label
                                                        htmlFor={`payment-employee-${index}`}
                                                        srOnly
                                                    >
                                                        Сотрудник {index + 1}
                                                    </ChakraField.Label>
                                                    <Controller
                                                        control={control}
                                                        name={`payments.${index}.employeeId`}
                                                        rules={{required: "Выберите сотрудника"}}
                                                        render={({field}) => (
                                                            <Select.Root
                                                                collection={employeeCollection}
                                                                value={field.value ? [field.value] : []}
                                                                onValueChange={(e) => field.onChange(e.value[0])}
                                                                disabled={isEmployeesLoading}
                                                                invalid={!!errors.payments?.[index]?.employeeId}
                                                                size="sm"
                                                            >
                                                                <Select.Trigger
                                                                    id={`payment-employee-${index}`}
                                                                    ref={field.ref}
                                                                    aria-describedby={
                                                                        errors.payments?.[index]?.employeeId
                                                                            ? `payment-employee-${index}-error`
                                                                            : undefined
                                                                    }
                                                                >
                                                                    {isEmployeesLoading ? (
                                                                        <Spinner size="xs" />
                                                                    ) : (
                                                                        <Select.ValueText placeholder="Сотрудник" />
                                                                    )}
                                                                </Select.Trigger>
                                                                <Select.Positioner>
                                                                    <Select.Content>
                                                                        {employeeCollection.items.map((emp) => (
                                                                            <Select.Item item={emp} key={emp.value}>
                                                                                {emp.label}
                                                                            </Select.Item>
                                                                        ))}
                                                                    </Select.Content>
                                                                </Select.Positioner>
                                                            </Select.Root>
                                                        )}
                                                    />
                                                    <ChakraField.ErrorText
                                                        id={`payment-employee-${index}-error`}
                                                    >
                                                        {errors.payments?.[index]?.employeeId?.message}
                                                    </ChakraField.ErrorText>
                                                </ChakraField.Root>

                                                <Input
                                                    type="number"
                                                    step="0.01"
                                                    size="sm"
                                                    placeholder="0"
                                                    {...register(`payments.${index}.percentFromRevenue` as const, { valueAsNumber: true })}
                                                />

                                                <Input
                                                    type="number"
                                                    size="sm"
                                                    placeholder="0"
                                                    {...register(`payments.${index}.tips` as const, { valueAsNumber: true })}
                                                />

                                                <Input
                                                    type="number"
                                                    step="0.5"
                                                    size="sm"
                                                    placeholder="ч"
                                                    {...register(`payments.${index}.workHours` as const, { valueAsNumber: true })}
                                                />

                                                <IconButton
                                                    aria-label="Delete"
                                                    colorPalette="red"
                                                    variant="subtle"
                                                    size="sm"
                                                    onClick={() => remove(index)}
                                                >
                                                    <HiTrash />
                                                </IconButton>
                                            </Grid>
                                        ))}
                                    </Stack>

                                    {fields.length === 0 && (
                                        <Text color="gray.500" fontSize="sm" textAlign="center" py={4}>
                                            Нет сотрудников в списке
                                        </Text>
                                    )}
                                </Box>
                            </Stack>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline" onClick={onClose} disabled={isSubmitting}>Отмена</Button>
                            </Dialog.ActionTrigger>
                            <Button
                                type="submit"
                                loading={isSubmitting}
                                loadingText={feedbackMessages.shiftResultSave.loading}
                                disabled={isSubmitting}
                            >
                                {initialData ? "Сохранить изменения" : "Создать"}
                            </Button>
                        </Dialog.Footer>
                    </form>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
}
