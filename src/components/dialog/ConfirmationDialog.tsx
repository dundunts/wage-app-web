"use client";

import {useEffect, useRef} from "react";
import {Button, Dialog, Portal} from "@chakra-ui/react";

type ConfirmationSeverity = "danger" | "warning";

interface ConfirmationDialogProps {
    open: boolean;
    title: string;
    description: string;
    confirmLabel: string;
    cancelLabel: string;
    pendingLabel?: string;
    severity: ConfirmationSeverity;
    pending: boolean;
    finalFocusEl?: () => HTMLElement | null;
    onCancel: () => void;
    onConfirm: () => void;
}

const severityPalette: Record<ConfirmationSeverity, "red" | "orange"> = {
    danger: "red",
    warning: "orange",
};

export function ConfirmationDialog({
    open,
    title,
    description,
    confirmLabel,
    cancelLabel,
    pendingLabel,
    severity,
    pending,
    finalFocusEl,
    onCancel,
    onConfirm,
}: ConfirmationDialogProps) {
    const returnFocusRef = useRef<HTMLElement | null>(null);

    useEffect(() => {
        if (open) {
            returnFocusRef.current = finalFocusEl?.() ?? null;
        }
    }, [finalFocusEl, open]);

    return (
        <Dialog.Root
            role="alertdialog"
            open={open}
            finalFocusEl={() => returnFocusRef.current}
            closeOnEscape={!pending}
            closeOnInteractOutside={!pending}
            onOpenChange={(details) => {
                if (!details.open && !pending) {
                    onCancel();
                }
            }}
        >
            <Portal>
                <Dialog.Backdrop />
                <Dialog.Positioner>
                    <Dialog.Content>
                        <Dialog.Header>
                            <Dialog.Title>{title}</Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Dialog.Description>{description}</Dialog.Description>
                        </Dialog.Body>
                        <Dialog.Footer>
                            <Dialog.CloseTrigger asChild>
                                <Button variant="outline" disabled={pending}>
                                    {cancelLabel}
                                </Button>
                            </Dialog.CloseTrigger>
                            <Button
                                colorPalette={severityPalette[severity]}
                                loading={pending}
                                loadingText={pendingLabel}
                                disabled={pending}
                                onClick={onConfirm}
                            >
                                {confirmLabel}
                            </Button>
                        </Dialog.Footer>
                    </Dialog.Content>
                </Dialog.Positioner>
            </Portal>
        </Dialog.Root>
    );
}
