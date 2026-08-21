// @/components/company/company-form-modal.tsx
"use client";

import { useEffect } from "react";
import {Resolver, useForm} from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
    Dialog,
    Button,
    Input,
    Stack,
    Field,
} from "@chakra-ui/react";
import { Company, CompanyPayload } from "@/types/company.types";
import { companySchema, CompanyFormValues } from "@/schemas/company.schema";
import {feedbackMessages} from "@/feedback/messages";

interface CompanyFormModalProps {
    isOpen: boolean;
    onClose: () => void;
    onSubmit: (data: CompanyPayload) => Promise<boolean>;
    initialData?: Company | null;
    isLoading?: boolean;
}

export const CompanyFormModal = ({
                                     isOpen,
                                     onClose,
                                     onSubmit,
                                     initialData,
                                     isLoading = false,
                                 }: CompanyFormModalProps) => {
    const isEditMode = !!initialData;

    const {
        register,
        handleSubmit,
        reset,
        formState: { errors },
    } = useForm<CompanyFormValues>({
        resolver: zodResolver(companySchema) as Resolver<CompanyFormValues>,
        defaultValues: {
            title: "",
            employeeWageCoefficientFromRevenue: 0,
            defaultShiftStartTime: "09:00",
        },
    });

    useEffect(() => {
        if (isOpen) {
            if (initialData) {
                reset({
                    title: initialData.title,
                    // API(350) -> UI(3.5)
                    employeeWageCoefficientFromRevenue: initialData.employeeWageCoefficientFromRevenue / 100,
                    defaultShiftStartTime: initialData.defaultShiftStartTime,
                });
            } else {
                reset({
                    title: "",
                    employeeWageCoefficientFromRevenue: 0,
                    defaultShiftStartTime: "09:00",
                });
            }
        }
    }, [isOpen, initialData, reset]);

    const onFormSubmit = async (data: CompanyFormValues) => {
        // UI(3.5) -> API(350)
        const payload: CompanyPayload = {
            ...data,
            employeeWageCoefficientFromRevenue: Math.round(data.employeeWageCoefficientFromRevenue * 100)
        };
        const succeeded = await onSubmit(payload);
        if (succeeded) {
            onClose();
        }
    };

    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>
                            {isEditMode ? "Редактирование компании" : "Создание компании"}
                        </Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <form id="company-form" onSubmit={handleSubmit(onFormSubmit)}>
                            <Stack gap={4}>
                                <Field.Root invalid={!!errors.title}>
                                    <Field.Label>Название компании</Field.Label>
                                    <Input {...register("title")} placeholder="Например, ООО Ромашка" />
                                    <Field.ErrorText>{errors.title?.message}</Field.ErrorText>
                                </Field.Root>

                                <Field.Root invalid={!!errors.employeeWageCoefficientFromRevenue}>
                                    <Field.Label>Коэффициент ЗП от выручки (%)</Field.Label>
                                    <Input
                                        type="number"
                                        step="0.01"
                                        {...register("employeeWageCoefficientFromRevenue")}
                                    />
                                    <Field.HelperText>
                                        Введите значение в процентах (например, 3.5 для 3.5%)
                                    </Field.HelperText>
                                    <Field.ErrorText>
                                        {errors.employeeWageCoefficientFromRevenue?.message}
                                    </Field.ErrorText>
                                </Field.Root>

                                <Field.Root invalid={!!errors.defaultShiftStartTime}>
                                    <Field.Label>Начало смены по умолчанию</Field.Label>
                                    <Input
                                        type="time"
                                        {...register("defaultShiftStartTime")}
                                    />
                                    <Field.ErrorText>
                                        {errors.defaultShiftStartTime?.message}
                                    </Field.ErrorText>
                                </Field.Root>
                            </Stack>
                        </form>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <Button variant="outline" disabled={isLoading}>
                                Отмена
                            </Button>
                        </Dialog.CloseTrigger>
                        <Button
                            type="submit"
                            form="company-form"
                            loading={isLoading}
                            loadingText={feedbackMessages[
                                isEditMode ? "companyUpdate" : "companyCreate"
                            ].loading}
                            disabled={isLoading}
                            colorPalette="blue"
                        >
                            {isEditMode ? "Сохранить" : "Создать"}
                        </Button>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};
