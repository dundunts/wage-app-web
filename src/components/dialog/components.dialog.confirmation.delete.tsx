import { Button, CloseButton, Dialog, Portal } from "@chakra-ui/react"

type ConfirmDeleteDialogProps = {
    open: boolean;
    onCLose: () => void;
    onConfirm: () => void;
    title?: string;
    message?: string;
}

const defaultTitle = "Вы уверены?"
const defaultMessage = "Подтверждение действия приведет к безвозвратному удалению"

const ConfirmDeleteDialog = (
    {
        open,
        onCLose,
        onConfirm,
        title = defaultTitle,
        message = defaultMessage
    }: ConfirmDeleteDialogProps
) => {
    return (
        <Dialog.Root role="alertdialog" open={open} onOpenChange={(details) => {
            if (!details.open) onCLose()
        }}>
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>{title}</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <p>{message}</p>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.ActionTrigger asChild>
                                <Button variant="outline">Отмена</Button>
                            </Dialog.ActionTrigger>
                            <Button colorPalette="red" onClick={onConfirm}>Удалить</Button>
                        </Dialog.Footer>
                        <Dialog.CloseTrigger asChild>
                            <CloseButton size="sm" />
                        </Dialog.CloseTrigger>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    )
}

export default ConfirmDeleteDialog;