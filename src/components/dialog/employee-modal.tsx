"use client";

import {
    Button,
    Checkbox,
    CheckboxGroup,
    createListCollection,
    Dialog,
    Field,
    Fieldset,
    Input,
    Select,
    SimpleGrid,
    Stack,
    Portal,
} from "@chakra-ui/react";
import {Controller, useController, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect} from "react";
import {Employee, EmployeePosition} from "@/types/employee.types";
import {useAllCompanies} from "@/hooks/useAllCompanies";
import {CreateEmployeeFormValues, createEmployeeSchema} from "@/schemas/employee.schema";
import {employeeService} from "@/service/employee/employee.service";
import {feedback} from "@/feedback/feedback";
import {feedbackMessages} from "@/feedback/messages";

interface EmployeeModalProps {
    isOpen: boolean;
    onClose: () => void;
    initialData?: Employee | null;
    onSuccess: () => void;
}

export const EmployeeModal = ({
                                  isOpen,
                                  onClose,
                                  initialData,
                                  onSuccess,
                              }: EmployeeModalProps) => {
    const {companies} = useAllCompanies();
    const isEditMode = !!initialData;

    const {
        register,
        handleSubmit,
        reset,
        control,
        formState: {errors, isSubmitting},
    } = useForm<CreateEmployeeFormValues>({
        resolver: zodResolver(createEmployeeSchema),
        defaultValues: {
            firstName: "",
            lastName: "",
            patronymic: "",
            simpleName: "",
            userId: "",
            position: EmployeePosition.WAITER_ACTIVE,
            companyIds: [],
        },
    });

    useEffect(() => {
        if (!isOpen) return;

        if (initialData) {
            reset({
                firstName: initialData.firstName,
                lastName: initialData.lastName,
                patronymic: initialData.patronymic,
                simpleName: initialData.simpleName ?? "",
                userId: initialData.userId ?? "",
                position: initialData.position,
                companyIds: initialData.companyIds ?? [],
            });
        } else {
            reset();
        }
    }, [isOpen, initialData, reset]);

    const positionsCollection = createListCollection({
        items: Object.values(EmployeePosition),
        itemToValue: position => position.toString(),
        itemToString: position => position.toString()
    })

    const onSubmit = async (data: CreateEmployeeFormValues) => {
        const action = isEditMode ? "employeeUpdate" : "employeeCreate";
        const actionFeedback = feedback.beginAction(action);
        try {
            const payload = {
                ...data,
                userId: data.userId || null,
                simpleName: data.simpleName || null,
            };

            if (isEditMode && initialData) {
                await employeeService.update(initialData.id, payload);
            } else {
                await employeeService.create(payload);
            }

            actionFeedback.success();
            onSuccess();
            onClose();
        } catch (error) {
            actionFeedback.error(error);
        }
    };

    const companyIds = useController({
        control,
        name: "companyIds",
        defaultValue: [],
    })

    const invalid = !!errors.companyIds

    return (
        <Dialog.Root
            open={isOpen}
            closeOnEscape={!isSubmitting}
            closeOnInteractOutside={!isSubmitting}
            scrollBehavior="inside"
            onOpenChange={(e) => !e.open && !isSubmitting && onClose()}
        >
            <Portal>
                <Dialog.Backdrop/>
                <Dialog.Positioner p={{base: 3, md: 6}}>
                    <Dialog.Content
                        as="form"
                        onSubmit={handleSubmit(onSubmit)}
                        maxW="3xl"
                    >
                        <Dialog.Header>
                            <Dialog.Title>
                                {isEditMode
                                    ? "Редактирование сотрудника"
                                    : "Создание сотрудника"}
                            </Dialog.Title>
                        </Dialog.Header>

                        <Dialog.Body>
                            <Stack gap={4}>
                            {/* ФИО */}
                            <SimpleGrid columns={{base: 1, md: 3}} gap={4}>
                                <Field.Root invalid={!!errors.lastName} disabled={isSubmitting}>
                                    <Field.Label color="fg.muted">
                                        Фамилия <Field.RequiredIndicator/>
                                    </Field.Label>
                                    <Input {...register("lastName")} aria-required="true" disabled={isSubmitting}/>
                                    <Field.ErrorText>
                                        {errors.lastName?.message}
                                    </Field.ErrorText>
                                </Field.Root>

                                <Field.Root invalid={!!errors.firstName} disabled={isSubmitting}>
                                    <Field.Label color="fg.muted">
                                        Имя <Field.RequiredIndicator/>
                                    </Field.Label>
                                    <Input {...register("firstName")} aria-required="true" disabled={isSubmitting}/>
                                    <Field.ErrorText>
                                        {errors.firstName?.message}
                                    </Field.ErrorText>
                                </Field.Root>

                                <Field.Root invalid={!!errors.patronymic} disabled={isSubmitting}>
                                    <Field.Label color="fg.muted">
                                        Отчество <Field.RequiredIndicator/>
                                    </Field.Label>
                                    <Input {...register("patronymic")} aria-required="true" disabled={isSubmitting}/>
                                    <Field.ErrorText>
                                        {errors.patronymic?.message}
                                    </Field.ErrorText>
                                </Field.Root>
                            </SimpleGrid>

                            {/* SimpleName / UserId */}
                            <SimpleGrid columns={{base: 1, md: 2}} gap={4}>
                                <Field.Root invalid={!!errors.simpleName} disabled={isSubmitting}>
                                    <Field.Label color="fg.muted">Simple name</Field.Label>
                                    <Input {...register("simpleName")} disabled={isSubmitting}/>
                                    <Field.ErrorText>{errors.simpleName?.message}</Field.ErrorText>
                                </Field.Root>

                                <Field.Root invalid={!!errors.userId} disabled={isSubmitting}>
                                    <Field.Label color="fg.muted">User ID</Field.Label>
                                    <Input {...register("userId")} disabled={isSubmitting}/>
                                    <Field.ErrorText>{errors.userId?.message}</Field.ErrorText>
                                </Field.Root>
                            </SimpleGrid>

                            {/* Должность */}
                            <Field.Root invalid={!!errors.position} required disabled={isSubmitting}>
                                <Field.Label color="fg.muted">Должность</Field.Label>
                                <Controller
                                    control={control}
                                    name={"position"}
                                    render={({field}) => (
                                        <Select.Root
                                            collection={positionsCollection}
                                            value={[Object.values(EmployeePosition).find(v => v.toString() === field.value) || ""]}
                                            onValueChange={e => field.onChange(e.value[0])}
                                            disabled={isSubmitting}
                                            size="sm"
                                        >
                                            <Select.HiddenSelect/>
                                            <Select.Control>
                                                <Select.Trigger bg="bg.raised" borderColor="border">
                                                    <Select.ValueText placeholder="Выберите должность"/>
                                                </Select.Trigger>
                                                <Select.IndicatorGroup>
                                                    <Select.Indicator/>
                                                </Select.IndicatorGroup>
                                            </Select.Control>
                                            <Select.Positioner>
                                                <Select.Content>
                                                    {positionsCollection.items.map((position) => (
                                                        <Select.Item item={position} key={position}>
                                                            {position}
                                                            <Select.ItemIndicator/>
                                                        </Select.Item>
                                                    ))}
                                                </Select.Content>
                                            </Select.Positioner>
                                        </Select.Root>
                                    )}
                                />
                                <Field.ErrorText>{errors.position?.message}</Field.ErrorText>
                            </Field.Root>

                            {/* Компании */}
                            <Fieldset.Root invalid={invalid} disabled={isSubmitting}>
                                <Fieldset.Legend color="fg.muted">Компании</Fieldset.Legend>
                                <CheckboxGroup
                                    invalid={invalid}
                                    value={companyIds.field.value}
                                    onValueChange={companyIds.field.onChange}
                                    name={companyIds.field.name}
                                >
                                    <Fieldset.Content>
                                        {companies.map((company) =>
                                            <Checkbox.Root
                                                key={company.id}
                                                value={company.id}
                                                colorPalette="brand"
                                                disabled={isSubmitting}
                                            >
                                                <Checkbox.HiddenInput/>
                                                <Checkbox.Control/>
                                                <Checkbox.Label>{company.title}</Checkbox.Label>
                                            </Checkbox.Root>
                                        )}
                                    </Fieldset.Content>
                                </CheckboxGroup>
                            </Fieldset.Root>
                            </Stack>
                        </Dialog.Body>

                        <Dialog.Footer>
                            <Button variant="outline" disabled={isSubmitting} onClick={onClose}>
                                Отмена
                            </Button>
                            <Button
                                type="submit"
                                colorPalette="brand"
                                loading={isSubmitting}
                                loadingText={feedbackMessages[
                                    isEditMode ? "employeeUpdate" : "employeeCreate"
                                ].loading}
                                disabled={isSubmitting}
                            >
                                {isEditMode ? "Сохранить" : "Создать"}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
};
