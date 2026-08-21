import {fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import CalcInShiftPage from "@/app/(main)/calculator/checkpoints/page";
import {Provider} from "@/components/ui/provider";
import {toaster} from "@/components/ui/toaster";
import {sessionService} from "@/service/session/session.service";
import {employeeService} from "@/service/employee/employee.service";

const navigation = vi.hoisted(() => ({push: vi.fn()}));
const searchParams = new URLSearchParams("sessionId=session-1");

vi.mock("next/navigation", () => ({
    useRouter: () => navigation,
    useSearchParams: () => searchParams,
}));

vi.mock("@/service/session/session.service", () => ({
    sessionService: {
        getAvailableById: vi.fn(),
        updateStartWorkTime: vi.fn(),
        close: vi.fn(),
    },
}));

vi.mock("@/service/employee/employee.service", () => ({
    employeeService: {getAvailableEmployeesForCompany: vi.fn()},
}));

vi.mock("@/service/checpoint/checkpoint.service", () => ({
    checkpointService: {
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

const session = {
    id: "session-1",
    companyId: "company-1",
    startWorkTime: "09:00",
    date: new Date("2026-08-21"),
    status: "OPENED" as const,
    checkpoints: [],
};

function renderPage() {
    render(
        <Provider defaultTheme="light">
            <CalcInShiftPage />
        </Provider>,
    );
}

async function openUpdateTimeDialog(user: ReturnType<typeof userEvent.setup>) {
    renderPage();
    await user.click(await screen.findByRole("button", {name: /09:00/}));
    return screen.getByLabelText("Время начала (ЧЧ:ММ)");
}

async function openCloseDialog(user: ReturnType<typeof userEvent.setup>) {
    renderPage();
    await user.click(await screen.findByRole("button", {name: "Закрыть смену"}));
    return screen.getByRole("alertdialog", {name: "Закрыть смену?"});
}

beforeEach(() => {
    toaster.remove();
    navigation.push.mockReset();
    vi.mocked(sessionService.getAvailableById).mockReset();
    vi.mocked(sessionService.getAvailableById).mockResolvedValue(session);
    vi.mocked(sessionService.updateStartWorkTime).mockReset();
    vi.mocked(sessionService.close).mockReset();
    vi.mocked(employeeService.getAvailableEmployeesForCompany).mockReset();
    vi.mocked(employeeService.getAvailableEmployeesForCompany).mockResolvedValue([]);
});

afterEach(() => vi.restoreAllMocks());

describe("Shift Session time update", () => {
    it("keeps the page visible, prevents repetition, reports success, and updates the displayed time", async () => {
        const user = userEvent.setup();
        let resolveUpdate!: () => void;
        vi.mocked(sessionService.updateStartWorkTime).mockReturnValue(new Promise((resolve) => {
            resolveUpdate = resolve;
        }));
        const input = await openUpdateTimeDialog(user);
        fireEvent.change(input, {target: {value: "08:30"}});

        await user.click(screen.getByRole("button", {name: "Сохранить"}));

        expect(screen.getByText("Расчёт за день")).toBeVisible();
        const pending = screen.getByRole("button", {name: "Время сохраняется"});
        expect(pending).toBeDisabled();
        expect(screen.getByRole("button", {name: "Отмена"})).toBeDisabled();
        await user.click(pending);
        expect(sessionService.updateStartWorkTime).toHaveBeenCalledOnce();
        expect(sessionService.updateStartWorkTime).toHaveBeenCalledWith({
            sessionId: "session-1",
            startWorkTime: "08:30",
        });

        resolveUpdate();

        expect(await screen.findByText("Время начала смены обновлено")).toBeVisible();
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
        expect(screen.getByRole("button", {name: /08:30/})).toBeVisible();
    });

    it("shows safe feedback and preserves the form and page context after failure", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend update detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(sessionService.updateStartWorkTime).mockRejectedValue(failure);
        const input = await openUpdateTimeDialog(user);
        fireEvent.change(input, {target: {value: "08:30"}});

        await user.click(screen.getByRole("button", {name: "Сохранить"}));

        expect(await screen.findByText("Время начала смены не обновлено")).toBeVisible();
        expect(screen.getByText("Не удалось выполнить действие. Попробуйте ещё раз")).toBeVisible();
        expect(screen.queryByText(/backend update detail/)).not.toBeInTheDocument();
        expect(screen.getByRole("dialog")).toBeVisible();
        expect(input).toHaveValue("08:30");
        expect(screen.getByRole("button", {name: "Сохранить"})).toBeEnabled();
        expect(screen.getByText("Расчёт за день")).toBeVisible();
        expect(screen.queryByText("Не удалось обновить время начала смены")).not.toBeInTheDocument();
        expect(screen.queryByText("Время начала смены обновлено")).not.toBeInTheDocument();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:shiftSessionUpdateTime]", failure);
    });

    it("keeps the existing validation inline and sends no request for invalid time", async () => {
        const user = userEvent.setup();
        const input = await openUpdateTimeDialog(user);
        fireEvent.change(input, {target: {value: ""}});

        await user.click(screen.getByRole("button", {name: "Сохранить"}));

        expect(await screen.findByText("Введите корректное время (ЧЧ:ММ)")).toBeVisible();
        expect(input).toHaveAttribute("aria-invalid", "true");
        expect(sessionService.updateStartWorkTime).not.toHaveBeenCalled();
    });

    it("cancels without updating the session time", async () => {
        const user = userEvent.setup();
        const input = await openUpdateTimeDialog(user);
        fireEvent.change(input, {target: {value: "08:30"}});

        await user.click(screen.getByRole("button", {name: "Отмена"}));

        expect(sessionService.updateStartWorkTime).not.toHaveBeenCalled();
        await waitFor(() => expect(screen.queryByRole("dialog")).not.toBeInTheDocument());
    });
});

describe("Shift Session close", () => {
    it("cancels from the shared alertdialog without closing the session", async () => {
        const user = userEvent.setup();
        const dialog = await openCloseDialog(user);

        expect(dialog).toBeVisible();
        expect(screen.getByText(/После закрытия редактирование чекпоинтов будет недоступно/)).toBeVisible();
        await user.click(screen.getByRole("button", {name: "Отмена"}));

        expect(sessionService.close).not.toHaveBeenCalled();
        await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    });

    it("prevents repetition, reports success, and navigates after closing", async () => {
        const user = userEvent.setup();
        let resolveClose!: () => void;
        vi.mocked(sessionService.close).mockReturnValue(new Promise((resolve) => {
            resolveClose = resolve;
        }));
        const dialog = await openCloseDialog(user);

        await user.click(within(dialog).getByRole("button", {name: "Закрыть смену"}));

        const pending = screen.getByRole("button", {name: "Смена закрывается"});
        expect(pending).toBeDisabled();
        expect(screen.getByRole("button", {name: "Отмена"})).toBeDisabled();
        await user.click(pending);
        expect(screen.getByText("Расчёт за день")).toBeVisible();
        expect(sessionService.close).toHaveBeenCalledOnce();
        expect(sessionService.close).toHaveBeenCalledWith("session-1");

        resolveClose();

        expect(await screen.findByText("Смена закрыта")).toBeVisible();
        await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
        expect(navigation.push).toHaveBeenCalledOnce();
        expect(navigation.push).toHaveBeenCalledWith("/calculator");
    });

    it("shows safe feedback and keeps the alertdialog and page context after failure", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend close detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(sessionService.close).mockRejectedValue(failure);
        const dialog = await openCloseDialog(user);

        await user.click(within(dialog).getByRole("button", {name: "Закрыть смену"}));

        expect(await screen.findByText("Смена не закрыта")).toBeVisible();
        expect(screen.getByText("Не удалось выполнить действие. Попробуйте ещё раз")).toBeVisible();
        expect(screen.queryByText(/backend close detail/)).not.toBeInTheDocument();
        expect(dialog).toBeVisible();
        expect(within(dialog).getByRole("button", {name: "Закрыть смену"})).toBeEnabled();
        expect(within(dialog).getByRole("button", {name: "Отмена"})).toBeEnabled();
        expect(screen.getByText("Расчёт за день")).toBeVisible();
        expect(screen.queryByText("Не удалось закрыть смену")).not.toBeInTheDocument();
        expect(screen.queryByText("Смена закрыта")).not.toBeInTheDocument();
        expect(navigation.push).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:shiftSessionClose]", failure);
    });
});
