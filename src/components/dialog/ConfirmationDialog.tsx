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

const severityPresentation: Record<ConfirmationSeverity, {
    colorPalette: "danger" | "warning";
    color: "status.danger" | "status.warning";
}> = {
    danger: {colorPalette: "danger", color: "status.danger"},
    warning: {colorPalette: "warning", color: "status.warning"},
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
    const cancelButtonRef = useRef<HTMLButtonElement>(null);

    useEffect(() => {
        if (open) {
            returnFocusRef.current = finalFocusEl?.() ?? null;
        }
    }, [finalFocusEl, open]);

    return (
        <Dialog.Root
            role="alertdialog"
            open={open}
            initialFocusEl={() => cancelButtonRef.current}
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
                <Dialog.Backdrop backdropFilter="blur(3px)" />
                <Dialog.Positioner p={{base: 4, md: 6}}>
                    <Dialog.Content
                        layerStyle="panel"
                        borderColor="border.emphasized"
                    >
                        <Dialog.Header>
                            <Dialog.Title color={severityPresentation[severity].color}>
                                {title}
                            </Dialog.Title>
                        </Dialog.Header>
                        <Dialog.Body>
                            <Dialog.Description color="fg.muted">
                                {description}
                            </Dialog.Description>
                        </Dialog.Body>
                        <Dialog.Footer flexDirection={{base: "column-reverse", sm: "row"}}>
                            <Button
                                ref={cancelButtonRef}
                                variant="outline"
                                disabled={pending}
                                onClick={onCancel}
                                w={{base: "full", sm: "auto"}}
                            >
                                {cancelLabel}
                            </Button>
                            <Button
                                colorPalette={severityPresentation[severity].colorPalette}
                                variant="solid"
                                loading={pending}
                                loadingText={pendingLabel}
                                disabled={pending}
                                onClick={onConfirm}
                                w={{base: "full", sm: "auto"}}
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
