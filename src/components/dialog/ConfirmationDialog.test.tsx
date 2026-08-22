import {useRef, useState} from "react";
import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {describe, expect, it, vi} from "vitest";
import {ConfirmationDialog} from "@/components/dialog/ConfirmationDialog";
import {Provider} from "@/components/ui/provider";

function DialogHarness({onCancel = vi.fn()}: {onCancel?: () => void}) {
    const [open, setOpen] = useState(false);
    const triggerRef = useRef<HTMLButtonElement>(null);

    return (
        <Provider defaultTheme="light">
            <button ref={triggerRef} onClick={() => setOpen(true)}>Открыть</button>
            <ConfirmationDialog
                open={open}
                title="Архивировать запись?"
                description="Запись перестанет отображаться в активном списке."
                confirmLabel="Архивировать"
                cancelLabel="Оставить"
                severity="warning"
                pending={false}
                finalFocusEl={() => triggerRef.current}
                onCancel={() => {
                    onCancel();
                    setOpen(false);
                }}
                onConfirm={vi.fn()}
            />
        </Provider>
    );
}

describe("ConfirmationDialog", () => {
    it("uses declarative content, contains keyboard focus, and restores it after Escape", async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn();
        render(<DialogHarness onCancel={onCancel} />);
        const trigger = screen.getByRole("button", {name: "Открыть"});

        await user.click(trigger);

        const dialog = screen.getByRole("alertdialog", {name: "Архивировать запись?"});
        expect(screen.getByText("Запись перестанет отображаться в активном списке.")).toBeVisible();
        expect(screen.getByRole("button", {name: "Оставить"})).toBeVisible();
        expect(screen.getByRole("button", {name: "Архивировать"})).toBeVisible();
        await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));
        await user.tab();
        expect(dialog).toContainElement(document.activeElement as HTMLElement);
        await user.tab({shift: true});
        expect(dialog).toContainElement(document.activeElement as HTMLElement);

        await user.keyboard("{Escape}");

        expect(onCancel).toHaveBeenCalledOnce();
        await waitFor(() => expect(trigger).toHaveFocus());
    });

    it("cannot be confirmed, cancelled, or dismissed while pending", async () => {
        const user = userEvent.setup();
        const onCancel = vi.fn();
        const onConfirm = vi.fn();
        render(
            <Provider defaultTheme="light">
                <ConfirmationDialog
                    open
                    title="Удалить запись?"
                    description="Действие необратимо."
                    confirmLabel="Удалить"
                    cancelLabel="Отмена"
                    pendingLabel="Запись удаляется"
                    severity="danger"
                    pending
                    onCancel={onCancel}
                    onConfirm={onConfirm}
                />
            </Provider>,
        );

        await user.click(screen.getByRole("button", {name: "Запись удаляется"}));
        await user.click(screen.getByRole("button", {name: "Отмена"}));
        await user.keyboard("{Escape}");

        expect(onConfirm).not.toHaveBeenCalled();
        expect(onCancel).not.toHaveBeenCalled();
        expect(screen.getByRole("alertdialog")).toBeVisible();
    });
});
