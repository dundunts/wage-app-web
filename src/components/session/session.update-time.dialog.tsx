import React from 'react';
import {Button, Dialog, Field, Input, Portal, Stack, Text} from "@chakra-ui/react";
import {useForm} from "react-hook-form";
import {z} from "zod";
import {zodResolver} from "@hookform/resolvers/zod";
import {feedbackMessages} from "@/feedback/messages";

// Схема валидации: строго формат HH:mm
const updateTimeSchema = z.object({
    startWorkTime: z.string().regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Введите корректное время (ЧЧ:ММ)")
});

type UpdateTimeFormValues = z.infer<typeof updateTimeSchema>;

interface SessionUpdateTimeDialogProps {
    open: boolean;
    onClose: () => void;
    currentStartTime: string; // HH:mm
    onSave: (time: string) => void | Promise<void>;
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
        void onSave(data.startWorkTime);
    };

    return (
        <Dialog.Root
            open={open}
            closeOnEscape={!isLoading}
            closeOnInteractOutside={!isLoading}
            onOpenChange={(e) => !e.open && !isLoading && onClose()}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner p={{base: 3, sm: 4}}>
            <Dialog.Content
                maxW="440px"
            >
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
                                    colorScheme="light dark"
                                    disabled={isLoading}
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

                <Dialog.Footer flexDirection={{base: "column-reverse", sm: "row"}}>
                    <Dialog.ActionTrigger asChild>
                        <Button variant="outline" onClick={onClose} disabled={isLoading} w={{base: "full", sm: "auto"}}>
                            Отмена
                        </Button>
                    </Dialog.ActionTrigger>
                    <Button
                        colorPalette="brand"
                        type="submit"
                        form="update-time-form"
                        loading={isLoading}
                        loadingText={feedbackMessages.shiftSessionUpdateTime.loading}
                        disabled={isLoading}
                        w={{base: "full", sm: "auto"}}
                    >
                        Сохранить
                    </Button>
                </Dialog.Footer>
                <Dialog.CloseTrigger aria-label="Закрыть диалог" onClick={onClose} disabled={isLoading} />
            </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}
