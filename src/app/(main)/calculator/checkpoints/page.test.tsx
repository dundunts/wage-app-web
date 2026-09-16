import {act, fireEvent, render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import CalcInShiftPage from "@/app/(main)/calculator/checkpoints/page";
import {Provider} from "@/components/ui/provider";
import {toaster} from "@/feedback/toast-store";
import {sessionService} from "@/service/session/session.service";
import {employeeService} from "@/service/employee/employee.service";
import {checkpointService} from "@/service/checpoint/checkpoint.service";
import {CheckpointCalcDestination, CheckpointType} from "@/types/checkpoint.types";
import {EmployeePosition} from "@/types/employee.types";

const navigation = vi.hoisted(() => ({push: vi.fn()}));
const searchParams = new URLSearchParams("sessionId=session-1");

vi.mock("next/navigation", () => ({
    useRouter: () => navigation,
    useSearchParams: () => searchParams,
}));

vi.mock("@/service/session/session.service", () => ({
    sessionService: {
        getAvailableById: vi.fn(),
        getQrTips: vi.fn(),
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

const employee = {
    id: "employee-1",
    userId: null,
    firstName: "Иван",
    lastName: "Иванов",
    patronymic: "Иванович",
    simpleName: "Иван",
    position: EmployeePosition.WAITER_ACTIVE,
};

const checkpoint = {
    id: "checkpoint-1",
    tips: 20,
    revenue: 100,
    employees: [employee],
    dateTime: new Date("2026-08-21T12:00:00"),
    type: CheckpointType.REGULAR,
    metricRecords: [
        {id: "metric-1", label: "Выручка", destination: CheckpointCalcDestination.REVENUE, value: 100},
        {id: "metric-2", label: "Чай", destination: CheckpointCalcDestination.TIPS, value: 20},
    ],
};

const session = {
    id: "session-1",
    companyId: "company-1",
    startWorkTime: "09:00",
    date: new Date("2026-08-21"),
    status: "OPENED" as const,
    checkpoints: [checkpoint],
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

async function openCreateCheckpointDialog(user: ReturnType<typeof userEvent.setup>) {
    renderPage();
    await user.click(await screen.findByRole("button", {name: "Добавить чекпоинт"}));
    return screen.getByRole("dialog", {name: "Создание чекпоинта"});
}

async function openUpdateCheckpointDialog(user: ReturnType<typeof userEvent.setup>) {
    renderPage();
    await user.click(await screen.findByRole("button", {name: "Изменить чекпоинт 1"}));
    return screen.getByRole("dialog", {name: "Редактирование чекпоинта"});
}

async function openDeleteCheckpointDialog(user: ReturnType<typeof userEvent.setup>) {
    renderPage();
    await user.click(await screen.findByRole("button", {name: "Удалить чекпоинт 1"}));
    return screen.getByRole("alertdialog", {name: "Удалить чекпоинт?"});
}

beforeEach(() => {
    toaster.remove();
    navigation.push.mockReset();
    vi.mocked(sessionService.getAvailableById).mockReset();
    vi.mocked(sessionService.getAvailableById).mockResolvedValue(session);
    vi.mocked(sessionService.getQrTips).mockReset();
    vi.mocked(sessionService.getQrTips).mockResolvedValue(0);
    vi.mocked(sessionService.updateStartWorkTime).mockReset();
    vi.mocked(sessionService.close).mockReset();
    vi.mocked(employeeService.getAvailableEmployeesForCompany).mockReset();
    vi.mocked(employeeService.getAvailableEmployeesForCompany).mockResolvedValue([employee]);
    vi.mocked(checkpointService.create).mockReset();
    vi.mocked(checkpointService.update).mockReset();
    vi.mocked(checkpointService.delete).mockReset();
});

afterEach(() => vi.restoreAllMocks());

describe("Checkpoint page loading", () => {
    it("shows Checkpoint as the current workflow stage", async () => {
        renderPage();

        expect(await screen.findByRole("heading", {name: "Расчёт за день"})).toBeVisible();
        expect(screen.getByRole("listitem", {name: "1. Сессия: завершён"})).toBeVisible();
        expect(screen.getByRole("listitem", {name: "2. Checkpoint: текущий"})).toHaveAttribute(
            "aria-current",
            "step",
        );
        expect(screen.getByRole("listitem", {name: "3. Расчёт: ожидает"})).toBeVisible();
    });

    it("keeps the existing page-level failure persistent", async () => {
        vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(sessionService.getAvailableById).mockRejectedValue(new Error("load failed"));

        renderPage();

        expect(await screen.findByText("Не удалось загрузить данные сессии")).toBeVisible();
        expect(screen.getByRole("button", {name: "Попробовать снова"})).toBeVisible();
        expect(screen.queryByText("Чекпоинт не создан")).not.toBeInTheDocument();
    });
});

describe("Checkpoint create", () => {
    it("exposes metric and date controls with accessible names", async () => {
        const user = userEvent.setup();
        const dialog = await openCreateCheckpointDialog(user);

        expect(within(dialog).getByRole("spinbutton", {name: "Выручка"})).toBeVisible();
        expect(within(dialog).getByRole("spinbutton", {name: "Чай (нал)"})).toBeVisible();
        expect(within(dialog).getByRole("spinbutton", {name: "Чай (по QR)"})).toBeVisible();
        expect(within(dialog).getByLabelText("Дата и время чекпоинта")).toBeVisible();
    });

    it("submits untouched metric fields with zero values", async () => {
        const user = userEvent.setup();
        vi.mocked(checkpointService.create).mockResolvedValue(checkpoint);
        const dialog = await openCreateCheckpointDialog(user);

        await user.click(within(dialog).getByRole("checkbox", {name: "Иван"}));
        await user.click(within(dialog).getByRole("button", {name: "Сохранить"}));

        expect(checkpointService.create).toHaveBeenCalledWith(expect.objectContaining({
            revenue: 0,
            tips: 0,
            employeeIds: [employee.id],
            type: CheckpointType.REGULAR,
            fieldRecords: [
                {
                    label: "Выручка",
                    destination: CheckpointCalcDestination.REVENUE,
                    value: 0,
                },
                {
                    label: "Чай",
                    destination: CheckpointCalcDestination.TIPS,
                    value: 0,
                },
            ],
        }));
    });

    it("announces the employee selection error inline", async () => {
        const user = userEvent.setup();
        const dialog = await openCreateCheckpointDialog(user);

        await user.click(within(dialog).getByRole("button", {name: "Сохранить"}));

        expect(within(dialog).getByRole("alert")).toHaveTextContent(
            "Выберите хотя бы одного сотрудника",
        );
        expect(checkpointService.create).not.toHaveBeenCalled();
    });

    it("submits the checkpoint form from the keyboard", async () => {
        const user = userEvent.setup();
        vi.mocked(checkpointService.create).mockResolvedValue(checkpoint);
        const dialog = await openCreateCheckpointDialog(user);
        await user.click(within(dialog).getByRole("checkbox", {name: "Иван"}));
        const revenue = within(dialog).getByRole("spinbutton", {name: "Выручка"});
        await user.clear(revenue);
        await user.type(revenue, "250{Enter}");

        expect(checkpointService.create).toHaveBeenCalledOnce();
    });

    it("keeps one local request pending and reports success before refreshing and closing", async () => {
        const user = userEvent.setup();
        let resolveCreate!: () => void;
        vi.mocked(checkpointService.create).mockReturnValue(new Promise((resolve) => {
            resolveCreate = () => resolve(checkpoint);
        }));
        const dialog = await openCreateCheckpointDialog(user);
        await user.click(within(dialog).getByRole("checkbox", {name: "Иван"}));

        await user.click(within(dialog).getByRole("button", {name: "Сохранить"}));

        expect(screen.getByText("Расчёт за день")).toBeVisible();
        const pending = within(dialog).getByRole("button", {name: "Чекпоинт создаётся"});
        expect(pending).toBeDisabled();
        expect(within(dialog).getByRole("button", {name: "Отмена"})).toBeDisabled();
        await user.click(pending);
        expect(checkpointService.create).toHaveBeenCalledOnce();

        resolveCreate();

        expect(await screen.findByText("Чекпоинт создан")).toBeVisible();
        await waitFor(() => expect(sessionService.getAvailableById).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(screen.queryByRole("dialog", {name: "Создание чекпоинта"})).not.toBeInTheDocument());
    });

    it("shows safe feedback and preserves the form and page after failure", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend create detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(checkpointService.create).mockRejectedValue(failure);
        const dialog = await openCreateCheckpointDialog(user);
        const employeeCheckbox = within(dialog).getByRole("checkbox", {name: "Иван"});
        await user.click(employeeCheckbox);

        await user.click(within(dialog).getByRole("button", {name: "Сохранить"}));

        expect(await screen.findByText("Чекпоинт не создан")).toBeVisible();
        expect(screen.getByText("Не удалось выполнить действие. Попробуйте ещё раз")).toBeVisible();
        expect(screen.queryByText(/backend create detail/)).not.toBeInTheDocument();
        expect(dialog).toBeVisible();
        expect(employeeCheckbox).toBeChecked();
        expect(within(dialog).getByRole("button", {name: "Сохранить"})).toBeEnabled();
        expect(screen.getByText("Расчёт за день")).toBeVisible();
        expect(screen.queryByText("Ошибка при создании чекпоинта")).not.toBeInTheDocument();
        expect(sessionService.getAvailableById).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:checkpointCreate]", failure);
    });
});

describe("QR Tips in new checkpoints", () => {
    it("loads only on opening and blocks submission until tips arrive", async () => {
        const user = userEvent.setup();
        let resolveTips!: (tips: number) => void;
        vi.mocked(sessionService.getQrTips).mockReturnValue(new Promise(resolve => { resolveTips = resolve; }));
        renderPage();
        const add = await screen.findByRole("button", {name: "Добавить чекпоинт"});
        expect(sessionService.getQrTips).not.toHaveBeenCalled();
        await user.click(add);
        const dialog = screen.getByRole("dialog", {name: "Создание чекпоинта"});

        expect(sessionService.getQrTips).toHaveBeenCalledWith("session-1", expect.any(AbortSignal));
        expect(within(dialog).getByRole("status")).toHaveTextContent("Загружаем чаевые по QR");
        expect(within(dialog).getByRole("spinbutton", {name: "Чай (по QR)"})).toBeDisabled();
        expect(within(dialog).getByRole("button", {name: "Обновить чаевые по QR"})).toBeDisabled();
        expect(within(dialog).getByRole("button", {name: "Сохранить"})).toBeDisabled();
        expect(within(dialog).getByRole("spinbutton", {name: "Чай (нал)"})).toBeEnabled();
        await user.click(within(dialog).getByRole("checkbox", {name: "Иван"}));
        fireEvent.submit(dialog);
        expect(checkpointService.create).not.toHaveBeenCalled();

        await act(async () => resolveTips(730));
        expect(within(dialog).getByRole("spinbutton", {name: "Чай (по QR)"})).toHaveValue(730);
        expect(within(dialog).getByRole("spinbutton", {name: "Чай (по QR)"})).toBeEnabled();
        expect(within(dialog).getByRole("button", {name: "Сохранить"})).toBeEnabled();
    });

    it("saves cumulative cash plus QR in the legacy record and reopens it in the unchanged editor", async () => {
        const user = userEvent.setup();
        vi.mocked(sessionService.getQrTips).mockResolvedValue(700);
        const savedCheckpoint = {
            ...checkpoint,
            tips: 1000,
            metricRecords: checkpoint.metricRecords.map(record => record.label === "Чай"
                ? {...record, value: 1000} : record),
        };
        vi.mocked(checkpointService.create).mockResolvedValue(savedCheckpoint);
        const dialog = await openCreateCheckpointDialog(user);
        fireEvent.change(within(dialog).getByRole("spinbutton", {name: "Чай (нал)"}), {target: {value: "300"}});
        await user.click(within(dialog).getByRole("checkbox", {name: "Иван"}));
        vi.mocked(sessionService.getAvailableById).mockResolvedValue({...session, checkpoints: [savedCheckpoint]});
        await user.click(within(dialog).getByRole("button", {name: "Сохранить"}));

        expect(checkpointService.create).toHaveBeenCalledWith(expect.objectContaining({
            tips: 1000,
            fieldRecords: [
                {label: "Выручка", destination: CheckpointCalcDestination.REVENUE, value: 0},
                {label: "Чай", destination: CheckpointCalcDestination.TIPS, value: 1000},
            ],
        }));
        await waitFor(() => expect(dialog).not.toBeInTheDocument());
        await user.click(screen.getByRole("button", {name: "Изменить чекпоинт 1"}));
        const edit = screen.getByRole("dialog", {name: "Редактирование чекпоинта"});
        expect(within(edit).getByRole("spinbutton", {name: "Чай"})).toHaveValue(1000);
        expect(within(edit).queryByRole("spinbutton", {name: "Чай (по QR)"})).not.toBeInTheDocument();
        expect(within(edit).queryByRole("button", {name: "Обновить чаевые по QR"})).not.toBeInTheDocument();
        expect(sessionService.getQrTips).toHaveBeenCalledOnce();
    });

    it("refresh replaces manual QR tips, preserves other input, and resets QR to zero on failure", async () => {
        const user = userEvent.setup();
        let resolveRefresh!: (tips: number) => void;
        vi.mocked(sessionService.getQrTips)
            .mockResolvedValueOnce(100)
            .mockImplementationOnce(() => new Promise(resolve => { resolveRefresh = resolve; }))
            .mockRejectedValueOnce(new Error("unavailable"));
        const dialog = await openCreateCheckpointDialog(user);
        const qr = within(dialog).getByRole("spinbutton", {name: "Чай (по QR)"});
        const cash = within(dialog).getByRole("spinbutton", {name: "Чай (нал)"});
        const refresh = within(dialog).getByRole("button", {name: "Обновить чаевые по QR"});
        fireEvent.change(qr, {target: {value: "200"}});
        fireEvent.change(cash, {target: {value: "50"}});
        await user.click(refresh);

        expect(qr).toBeDisabled();
        expect(refresh).toBeDisabled();
        expect(within(dialog).getByRole("button", {name: "Сохранить"})).toBeDisabled();
        expect(checkpointService.create).not.toHaveBeenCalled();
        await user.click(refresh);
        expect(sessionService.getQrTips).toHaveBeenCalledTimes(2);
        await act(async () => resolveRefresh(350));
        expect(qr).toHaveValue(350);
        expect(cash).toHaveValue(50);

        await user.click(refresh);
        expect(qr).toHaveValue(0);
        expect(cash).toHaveValue(50);
        expect(qr).toBeEnabled();
        expect(within(dialog).getByRole("button", {name: "Сохранить"})).toBeEnabled();
        expect(screen.queryByRole("alert")).not.toBeInTheDocument();
    });

    it("allows manual input and retry after the initial request fails", async () => {
        const user = userEvent.setup();
        vi.mocked(sessionService.getQrTips)
            .mockRejectedValueOnce(new Error("timeout"))
            .mockResolvedValueOnce(500);
        const dialog = await openCreateCheckpointDialog(user);
        const qr = within(dialog).getByRole("spinbutton", {name: "Чай (по QR)"});
        expect(qr).toHaveValue(0);
        expect(qr).toBeEnabled();
        fireEvent.change(qr, {target: {value: "120"}});
        expect(qr).toHaveValue(120);
        await user.click(within(dialog).getByRole("button", {name: "Обновить чаевые по QR"}));
        expect(qr).toHaveValue(500);
    });

    it("preserves cash and QR while switching types and includes all final tip sources once", async () => {
        const user = userEvent.setup();
        vi.mocked(sessionService.getQrTips).mockResolvedValue(700);
        vi.mocked(checkpointService.create).mockResolvedValue(checkpoint);
        const dialog = await openCreateCheckpointDialog(user);
        fireEvent.change(within(dialog).getByRole("spinbutton", {name: "Чай (нал)"}), {target: {value: "300"}});
        fireEvent.change(within(dialog).getByRole("spinbutton", {name: "Чай (по QR)"}), {target: {value: "800"}});
        await user.click(within(dialog).getByRole("radio", {name: "Финальный"}));
        expect(within(dialog).getByRole("spinbutton", {name: "Чай (нал)"})).toHaveValue(300);
        expect(within(dialog).getByRole("spinbutton", {name: "Чай (по QR)"})).toHaveValue(800);
        await user.click(within(dialog).getByRole("radio", {name: "Обычный"}));
        expect(within(dialog).getByRole("spinbutton", {name: "Чай (по QR)"})).toHaveValue(800);
        await user.click(within(dialog).getByRole("radio", {name: "Финальный"}));
        fireEvent.change(within(dialog).getByRole("spinbutton", {name: "Кредит. карты (обс)"}), {target: {value: "200"}});
        fireEvent.change(within(dialog).getByLabelText("Дата и время чекпоинта"), {target: {value: "2026-08-21T10:00"}});
        await user.click(within(dialog).getByRole("checkbox", {name: "Иван"}));
        await user.click(within(dialog).getByRole("button", {name: "Сохранить"}));

        expect(sessionService.getQrTips).toHaveBeenCalledOnce();
        expect(checkpointService.create).toHaveBeenCalledWith(expect.objectContaining({
            tips: 1300,
            type: CheckpointType.FINAL,
            fieldRecords: expect.arrayContaining([
                {label: "Чай (нал)", destination: CheckpointCalcDestination.TIPS, value: 300},
                {label: "Чай (по QR)", destination: CheckpointCalcDestination.TIPS, value: 800},
                {label: "Кредит. карты (обс)", destination: CheckpointCalcDestination.TIPS, value: 200},
            ]),
        }));
    });

    it("refetches on reopening and ignores a late response from the closed dialog", async () => {
        const user = userEvent.setup();
        let resolveOld!: (tips: number) => void;
        vi.mocked(sessionService.getQrTips)
            .mockImplementationOnce(() => new Promise(resolve => { resolveOld = resolve; }))
            .mockResolvedValueOnce(250);
        const dialog = await openCreateCheckpointDialog(user);
        const oldSignal = vi.mocked(sessionService.getQrTips).mock.calls[0][1];
        fireEvent.change(within(dialog).getByRole("spinbutton", {name: "Чай (нал)"}), {target: {value: "90"}});
        await user.click(within(dialog).getByRole("button", {name: "Отмена"}));
        expect(oldSignal.aborted).toBe(true);
        await user.click(screen.getByRole("button", {name: "Добавить чекпоинт"}));
        const reopened = screen.getByRole("dialog", {name: "Создание чекпоинта"});
        expect(within(reopened).getByRole("spinbutton", {name: "Чай (по QR)"})).toHaveValue(250);
        expect(within(reopened).getByRole("spinbutton", {name: "Чай (нал)"})).toHaveValue(0);
        await act(async () => resolveOld(999));
        expect(within(reopened).getByRole("spinbutton", {name: "Чай (по QR)"})).toHaveValue(250);
        expect(sessionService.getQrTips).toHaveBeenCalledTimes(2);
    });

    it("keeps final checkpoint editing local with its saved cash and QR fields", async () => {
        const user = userEvent.setup();
        const finalCheckpoint = {
            ...checkpoint,
            type: CheckpointType.FINAL,
            tips: 900,
            metricRecords: [
                {id: "cash", label: "Чай (нал)", destination: CheckpointCalcDestination.TIPS, value: 300},
                {id: "qr", label: "Чай (по QR)", destination: CheckpointCalcDestination.TIPS, value: 600},
            ],
        };
        vi.mocked(sessionService.getAvailableById).mockResolvedValue({...session, checkpoints: [finalCheckpoint]});
        vi.mocked(checkpointService.update).mockResolvedValue(finalCheckpoint);
        const dialog = await openUpdateCheckpointDialog(user);
        expect(within(dialog).getByRole("spinbutton", {name: "Чай (по QR)"})).toHaveValue(600);
        expect(within(dialog).getByRole("spinbutton", {name: "Чай (нал)"})).toHaveValue(300);
        expect(within(dialog).queryByRole("button", {name: "Обновить чаевые по QR"})).not.toBeInTheDocument();
        fireEvent.change(within(dialog).getByRole("spinbutton", {name: "Чай (по QR)"}), {target: {value: "650"}});
        await user.click(within(dialog).getByRole("button", {name: "Сохранить"}));
        expect(checkpointService.update).toHaveBeenCalledWith(expect.objectContaining({tips: 950}));
        expect(sessionService.getQrTips).not.toHaveBeenCalled();
    });
});

describe("Checkpoint update", () => {
    it("prevents repetition, reports success, refreshes, and closes", async () => {
        const user = userEvent.setup();
        let resolveUpdate!: () => void;
        vi.mocked(checkpointService.update).mockReturnValue(new Promise((resolve) => {
            resolveUpdate = () => resolve(checkpoint);
        }));
        const dialog = await openUpdateCheckpointDialog(user);

        await user.click(within(dialog).getByRole("button", {name: "Сохранить"}));

        const pending = within(dialog).getByRole("button", {name: "Чекпоинт обновляется"});
        expect(pending).toBeDisabled();
        await user.click(pending);
        expect(checkpointService.update).toHaveBeenCalledOnce();

        resolveUpdate();

        expect(await screen.findByText("Чекпоинт обновлён")).toBeVisible();
        await waitFor(() => expect(sessionService.getAvailableById).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(screen.queryByRole("dialog", {name: "Редактирование чекпоинта"})).not.toBeInTheDocument());
    });

    it("keeps entered data and the dialog recoverable after failure", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend update detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(checkpointService.update).mockRejectedValue(failure);
        const dialog = await openUpdateCheckpointDialog(user);
        const revenueInput = within(dialog).getByDisplayValue("100");
        await user.clear(revenueInput);
        await user.type(revenueInput, "250");

        await user.click(within(dialog).getByRole("button", {name: "Сохранить"}));

        expect(await screen.findByText("Чекпоинт не обновлён")).toBeVisible();
        expect(dialog).toBeVisible();
        expect(revenueInput).toHaveValue(250);
        expect(within(dialog).getByRole("button", {name: "Сохранить"})).toBeEnabled();
        expect(screen.getByText("Расчёт за день")).toBeVisible();
        expect(screen.queryByText("Ошибка при обновлении чекпоинта")).not.toBeInTheDocument();
        expect(sessionService.getAvailableById).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:checkpointUpdate]", failure);
    });
});

describe("Checkpoint delete", () => {
    it("uses the shared alertdialog and cancels without a request", async () => {
        const user = userEvent.setup();
        const dialog = await openDeleteCheckpointDialog(user);

        expect(screen.getByText(/будет удалён без возможности восстановления/)).toBeVisible();
        await user.click(within(dialog).getByRole("button", {name: "Отмена"}));

        expect(checkpointService.delete).not.toHaveBeenCalled();
        await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    });

    it("prevents duplicate requests, reports success, and refreshes the checkpoints", async () => {
        const user = userEvent.setup();
        let resolveDelete!: () => void;
        vi.mocked(checkpointService.delete).mockReturnValue(new Promise((resolve) => {
            resolveDelete = resolve;
        }));
        const dialog = await openDeleteCheckpointDialog(user);

        await user.click(within(dialog).getByRole("button", {name: "Удалить"}));

        const pending = within(dialog).getByRole("button", {name: "Чекпоинт удаляется"});
        expect(pending).toBeDisabled();
        expect(within(dialog).getByRole("button", {name: "Отмена"})).toBeDisabled();
        await user.click(pending);
        expect(checkpointService.delete).toHaveBeenCalledOnce();
        expect(checkpointService.delete).toHaveBeenCalledWith("checkpoint-1");

        resolveDelete();

        expect(await screen.findByText("Чекпоинт удалён")).toBeVisible();
        await waitFor(() => expect(sessionService.getAvailableById).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    });

    it("keeps a failed deletion available for retry or cancel", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend delete detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(checkpointService.delete)
            .mockRejectedValueOnce(failure)
            .mockResolvedValueOnce();
        const dialog = await openDeleteCheckpointDialog(user);

        await user.click(within(dialog).getByRole("button", {name: "Удалить"}));

        expect(await screen.findByText("Чекпоинт не удалён")).toBeVisible();
        expect(dialog).toBeVisible();
        expect(within(dialog).getByRole("button", {name: "Удалить"})).toBeEnabled();
        expect(within(dialog).getByRole("button", {name: "Отмена"})).toBeEnabled();
        expect(screen.getByText("Расчёт за день")).toBeVisible();
        expect(screen.queryByText("Ошибка при удалении чекпоинта")).not.toBeInTheDocument();
        expect(sessionService.getAvailableById).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:checkpointDelete]", failure);

        await user.click(within(dialog).getByRole("button", {name: "Удалить"}));

        expect(await screen.findByText("Чекпоинт удалён")).toBeVisible();
        expect(checkpointService.delete).toHaveBeenCalledTimes(2);
        await waitFor(() => expect(sessionService.getAvailableById).toHaveBeenCalledTimes(2));
    });
});

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
        const pending = screen.getByRole("button", {name: "Время смены обновляется"});
        expect(pending).toBeDisabled();
        expect(input).toBeDisabled();
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
