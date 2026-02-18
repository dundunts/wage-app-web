import React from 'react';
import {Button, Dialog, Field, Input, Stack, Text} from "@chakra-ui/react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";

// Схема валидации: строго формат HH:mm
const updateTimeSchema = z.object({
    startWorkTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Введите корректное время (ЧЧ:ММ)")
});

type UpdateTimeFormValues = z.infer<typeof updateTimeSchema>;

interface SessionUpdateTimeDialogProps {
    open: boolean;
    onClose: () => void;
    currentStartTime: string; // HH:mm
    onSave: (time: string) => void;
    isLoading?: boolean;
}

export function SessionUpdateTimeDialog({
                                            open,
                                            onClose,
                                            currentStartTime,
                                            onSave,
                                            isLoading
                                        }: SessionUpdateTimeDialogProps) {
    const {
        register,
        handleSubmit,
        formState: {errors},
        reset
    } = useForm<UpdateTimeFormValues>({
        resolver: zodResolver(updateTimeSchema),
        defaultValues: {
            startWorkTime: currentStartTime
        }
    });

    // Сброс формы при открытии с новым значением
    React.useEffect(() => {
        if (open) {
            reset({startWorkTime: currentStartTime});
        }
    }, [open, currentStartTime, reset]);

    const onSubmit = (data: UpdateTimeFormValues) => {
        onSave(data.startWorkTime);
    };

    return (
        <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title>Изменить начало смены</Dialog.Title>
                </Dialog.Header>

                <Dialog.Body>
                    <form id="update-time-form" onSubmit={handleSubmit(onSubmit)}>
                        <Stack gap={4}>
                            <Text fontSize="sm" color="fg.muted">
                                Укажите фактическое время начала работы. Это повлияет на расчет рабочих часов.
                            </Text>

                            <Field.Root invalid={!!errors.startWorkTime}>
                                <Field.Label>Время начала (ЧЧ:ММ)</Field.Label>
                                <Input
                                    type="time"
                                    size="lg"
                                    {...register("startWorkTime")}
                                />
                                <Field.ErrorText>
                                    {errors.startWorkTime?.message}
                                </Field.ErrorText>
                            </Field.Root>
                        </Stack>
                    </form>
                </Dialog.Body>

                <Dialog.Footer>
                    <Dialog.ActionTrigger asChild>
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Отмена
                        </Button>
                    </Dialog.ActionTrigger>
                    <Button
                        colorPalette="teal"
                        type="submit"
                        form="update-time-form"
                        loading={isLoading}
                    >
                        Сохранить
                    </Button>
                </Dialog.Footer>
                <Dialog.CloseTrigger onClick={onClose} />
            </Dialog.Content>
        </Dialog.Root>
    );
}