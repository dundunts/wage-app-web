import React from 'react';
import {Button, Dialog, Text} from "@chakra-ui/react";
import {CheckCircle} from "lucide-react";

interface SessionCloseDialogProps {
    open: boolean;
    onClose: () => void;
    onConfirm: () => void;
    isLoading?: boolean;
}

export function SessionCloseDialog({
                                       open,
                                       onClose,
                                       onConfirm,
                                       isLoading
                                   }: SessionCloseDialogProps) {
    return (
        <Dialog.Root open={open} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Content>
                <Dialog.Header>
                    <Dialog.Title display="flex" alignItems="center" gap={2}>
                        <CheckCircle color="teal" /> Закрытие смены
                    </Dialog.Title>
                </Dialog.Header>

                <Dialog.Body>
                    <Text>
                        Вы уверены, что хотите закрыть текущую смену?
                        После закрытия редактирование чекпоинтов будет недоступно,
                        и начнется финальный пересчет.
                    </Text>
                </Dialog.Body>

                <Dialog.Footer>
                    <Dialog.ActionTrigger asChild>
                        <Button variant="outline" onClick={onClose} disabled={isLoading}>
                            Отмена
                        </Button>
                    </Dialog.ActionTrigger>
                    <Button
                        colorPalette="red"
                        variant="solid"
                        onClick={onConfirm}
                        loading={isLoading}
                    >
                        Закрыть смену
                    </Button>
                </Dialog.Footer>
                <Dialog.CloseTrigger onClick={onClose} />
            </Dialog.Content>
        </Dialog.Root>
    );
}