import {fireEvent, render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {SessionOpenDialog} from "@/components/session/session.open.dialog";
import {Provider} from "@/components/ui/provider";
import {toaster} from "@/feedback/toast-store";
import {sessionService} from "@/service/session/session.service";

const navigation = vi.hoisted(() => ({push: vi.fn()}));

vi.mock("next/navigation", () => ({
    useRouter: () => navigation,
}));

vi.mock("@/service/session/session.service", () => ({
    sessionService: {open: vi.fn()},
}));

const company = {
    id: "company-1",
    title: "Компания",
    employeeWageCoefficientFromRevenue: 0.4,
    defaultShiftStartTime: "09:00",
};

const openedSession = {
    id: "session-1",
    companyId: company.id,
    startWorkTime: "09:00",
    date: new Date("2026-08-21"),
    status: "OPENED" as const,
    checkpoints: [],
};

function renderDialog() {
    render(
        <Provider defaultTheme="light">
            <SessionOpenDialog company={company} />
        </Provider>,
    );
}

beforeEach(() => {
    toaster.remove();
    navigation.push.mockReset();
    vi.mocked(sessionService.open).mockReset();
});

afterEach(() => vi.restoreAllMocks());

describe("SessionOpenDialog", () => {
    it("shows pending, sends one request, reports success, and navigates to the opened session", async () => {
        const user = userEvent.setup();
        let resolveOpen!: (session: typeof openedSession) => void;
        vi.mocked(sessionService.open).mockReturnValue(new Promise((resolve) => {
            resolveOpen = resolve;
        }));
        renderDialog();

        await user.click(screen.getByRole("button", {name: "Открыть сессию"}));
        const dateTime = screen.getByLabelText("Дата и время начала");
        const submit = screen.getByRole("button", {name: "Открыть"});
        await user.click(submit);

        const pending = screen.getByRole("button", {name: "Смена открывается"});
        expect(pending).toBeDisabled();
        expect(dateTime).toBeDisabled();
        expect(screen.getByRole("button", {name: "Отмена"})).toBeDisabled();
        await user.click(pending);
        expect(sessionService.open).toHaveBeenCalledOnce();

        resolveOpen(openedSession);

        expect(await screen.findByText("Смена открыта")).toBeVisible();
        expect(navigation.push).toHaveBeenCalledOnce();
        expect(navigation.push).toHaveBeenCalledWith(
            "/calculator/checkpoints?sessionId=session-1",
        );
    });

    it("shows safe Russian feedback and preserves the dialog and entered value after failure", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend opening detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(sessionService.open)
            .mockRejectedValueOnce(failure)
            .mockResolvedValueOnce(openedSession);
        renderDialog();
        await user.click(screen.getByRole("button", {name: "Открыть сессию"}));
        const dateTime = screen.getByLabelText("Дата и время начала");
        fireEvent.change(dateTime, {target: {value: "2026-08-20T08:30"}});

        await user.click(screen.getByRole("button", {name: "Открыть"}));

        expect(await screen.findByText("Смена не открыта")).toBeVisible();
        expect(screen.getByText("Не удалось выполнить действие. Попробуйте ещё раз")).toBeVisible();
        expect(screen.queryByText(/backend opening detail/)).not.toBeInTheDocument();
        expect(screen.getByRole("dialog")).toBeVisible();
        expect(dateTime).toHaveValue("2026-08-20T08:30");
        expect(screen.getByRole("button", {name: "Открыть"})).toBeEnabled();
        expect(screen.queryByText("Смена открыта")).not.toBeInTheDocument();
        expect(navigation.push).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:shiftSessionOpen]", failure);

        await user.click(screen.getByRole("button", {name: "Открыть"}));
        expect(await screen.findByText("Смена открыта")).toBeVisible();
        expect(sessionService.open).toHaveBeenCalledTimes(2);
    });

    it("cancels without opening a session", async () => {
        const user = userEvent.setup();
        renderDialog();

        await user.click(screen.getByRole("button", {name: "Открыть сессию"}));
        await user.click(screen.getByRole("button", {name: "Отмена"}));

        expect(sessionService.open).not.toHaveBeenCalled();
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });
});
