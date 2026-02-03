// @/components/dialog/delete-confirm-modal.tsx
"use client";

import { Dialog, Button, Text } from "@chakra-ui/react";

interface DeleteConfirmModalProps {
    isOpen: boolean;
    onClose: () => void;
    onConfirm: () => Promise<void>;
    title?: string;
    description?: string;
    isLoading?: boolean;
}

export const DeleteConfirmModal = ({
                                       isOpen,
                                       onClose,
                                       onConfirm,
                                       title = "Удаление",
                                       description = "Вы уверены? Это действие нельзя отменить.",
                                       isLoading = false,
                                   }: DeleteConfirmModalProps) => {
    return (
        <Dialog.Root open={isOpen} onOpenChange={(e) => !e.open && onClose()}>
            <Dialog.Backdrop />
            <Dialog.Positioner>
                <Dialog.Content>
                    <Dialog.Header>
                        <Dialog.Title>{title}</Dialog.Title>
                    </Dialog.Header>
                    <Dialog.Body>
                        <Text>{description}</Text>
                    </Dialog.Body>
                    <Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <Button variant="outline" disabled={isLoading}>
                                Отмена
                            </Button>
                        </Dialog.CloseTrigger>
                        <Button
                            colorPalette="red"
                            onClick={onConfirm}
                            loading={isLoading}
                        >
                            Удалить
                        </Button>
                    </Dialog.Footer>
                </Dialog.Content>
            </Dialog.Positioner>
        </Dialog.Root>
    );
};