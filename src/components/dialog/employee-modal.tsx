"use client";

import {
    Dialog,
    Button,
    Text,
    Stack,
    SimpleGrid,
    Box,
    Input,
    Select,
    Checkbox,
    Field, Portal, createListCollection, CheckboxGroup,
    Fieldset,
} from "@chakra-ui/react";
import {Controller, useController, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useEffect} from "react";
import {Employee, EmployeePosition} from "@/types/employee.types";
import {useAllCompanies} from "@/hooks/use-all-companies";
import {CreateEmployeeFormValues, createEmployeeSchema} from "@/schemas/employee.schema";
import {createEmployee, updateEmployee} from "@/service/employee/employee.service";
import {toaster} from "@/components/ui/toaster";
import {Demo} from "@/components/dialog/demo";

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
    const {companies, isLoading: isCompaniesLoading} = useAllCompanies();
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
            console.log("RESET TO INITIAL DATA")
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
        try {
            const payload = {
                ...data,
                userId: data.userId || null,
                simpleName: data.simpleName || null,
            };

            if (isEditMode && initialData) {
                await updateEmployee(initialData.id, payload);
                toaster.create({title: "Сотрудник обновлён", type: "success"});
            } else {
                await createEmployee(payload);
                toaster.create({title: "Сотрудник создан", type: "success"});
            }

            onSuccess();
            onClose();
        } catch (e) {
            console.error(e);
            toaster.create({
                title: "Ошибка",
                description: "Не удалось сохранить данные сотрудника",
                type: "error",
            });
        }
    };

    const companyIds = useController({
        control,
        name: "companyIds",
        defaultValue: [],
    })

    const invalid = !!errors.companyIds

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop/>
            <Dialog.Positioner>
                <Dialog.Content as="form" onSubmit={handleSubmit(onSubmit)}>
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
                                <Field.Root invalid={!!errors.lastName}>
                                    <Field.Label>Фамилия</Field.Label>
                                    <Input {...register("lastName")} />
                                    <Field.ErrorText>
                                        {errors.lastName?.message}
                                    </Field.ErrorText>
                                </Field.Root>

                                <Field.Root invalid={!!errors.firstName}>
                                    <Field.Label>Имя</Field.Label>
                                    <Input {...register("firstName")} />
                                    <Field.ErrorText>
                                        {errors.firstName?.message}
                                    </Field.ErrorText>
                                </Field.Root>

                                <Field.Root invalid={!!errors.patronymic}>
                                    <Field.Label>Отчество</Field.Label>
                                    <Input {...register("patronymic")} />
                                    <Field.ErrorText>
                                        {errors.patronymic?.message}
                                    </Field.ErrorText>
                                </Field.Root>
                            </SimpleGrid>

                            {/* SimpleName / UserId */}
                            <SimpleGrid columns={{base: 1, md: 2}} gap={4}>
                                <Field.Root invalid={!!errors.simpleName}>
                                    <Field.Label>Simple name</Field.Label>
                                    <Input {...register("simpleName")} />
                                </Field.Root>

                                <Field.Root invalid={!!errors.userId}>
                                    <Field.Label>User ID</Field.Label>
                                    <Input {...register("userId")} />
                                </Field.Root>
                            </SimpleGrid>

                            {/* Должность */}
                            <Field.Root invalid={!!errors.position}>
                                <Field.Label>Должность</Field.Label>
                                <Controller
                                    control={control}
                                    name={"position"}
                                    render={({field}) => (
                                        <Select.Root
                                            collection={positionsCollection}
                                            value={[Object.values(EmployeePosition).find(v => v.toString() === field.value) || ""]}
                                            onValueChange={e => field.onChange(e.value[0])}
                                            size="sm"
                                        >
                                            <Select.HiddenSelect/>
                                            <Select.Label>Select position</Select.Label>
                                            <Select.Control>
                                                <Select.Trigger>
                                                    <Select.ValueText placeholder="Select position"/>
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
                            </Field.Root>

                            {/* Компании */}
                            <Fieldset.Root invalid={invalid}>
                                <Fieldset.Legend>Компании</Fieldset.Legend>
                                <CheckboxGroup
                                    invalid={invalid}
                                    value={companyIds.field.value}
                                    onValueChange={companyIds.field.onChange}
                                    name={companyIds.field.name}
                                >
                                    <Fieldset.Content>
                                        {companies.map((company) =>
                                            <Checkbox.Root key={company.id} value={company.id}>
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
                        <Dialog.CloseTrigger asChild>
                            <Button variant="outline">Отмена</Button>
                        </Dialog.CloseTrigger>
                        <Button
                            type="submit"
                            colorPalette="blue"
                            loading={isSubmitting}
                        >
                            {isEditMode ? "Сохранить" : "Создать"}
                        </Button>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
