import {render, screen, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {EmployeeModal} from "@/components/dialog/employee-modal";
import {Provider} from "@/components/ui/provider";
import {toaster} from "@/feedback/toast-store";
import {employeeService} from "@/service/employee/employee.service";
import {EmployeePosition} from "@/types/employee.types";

vi.mock("@/hooks/useAllCompanies", () => ({
    useAllCompanies: () => ({
        companies: [{
            id: "company-1",
            title: "Компания",
            employeeWageCoefficientFromRevenue: 350,
            defaultShiftStartTime: "09:00",
        }],
        isLoading: false,
        isError: false,
    }),
}));

vi.mock("@/service/employee/employee.service", () => ({
    employeeService: {
        create: vi.fn(),
        update: vi.fn(),
    },
}));

function renderModal(props: Partial<React.ComponentProps<typeof EmployeeModal>> = {}) {
    const onClose = vi.fn();
    const onSuccess = vi.fn();
    render(
        <Provider defaultTheme="light">
            <EmployeeModal
                isOpen
                onClose={onClose}
                onSuccess={onSuccess}
                initialData={null}
                {...props}
            />
        </Provider>,
    );
    return {onClose, onSuccess};
}

async function fillRequiredEmployeeFields(user: ReturnType<typeof userEvent.setup>) {
    const dialog = screen.getByRole("dialog", {name: "Создание сотрудника"});
    await user.type(within(dialog).getByRole("textbox", {name: "Фамилия"}), "Иванов");
    await user.type(within(dialog).getByRole("textbox", {name: "Имя"}), "Иван");
    await user.type(within(dialog).getByRole("textbox", {name: "Отчество"}), "Иванович");
    return dialog;
}

beforeEach(() => {
    toaster.remove();
    vi.mocked(employeeService.create).mockReset();
    vi.mocked(employeeService.update).mockReset();
});

afterEach(() => vi.restoreAllMocks());

describe("Employee creation", () => {
    it("shows existing required-field validation inline without a request", async () => {
        const user = userEvent.setup();
        renderModal();
        const dialog = screen.getByRole("dialog", {name: "Создание сотрудника"});

        await user.click(within(dialog).getByRole("button", {name: "Создать"}));

        const error = await screen.findByText("Фамилия обязательна");
        const lastName = within(dialog).getByRole("textbox", {name: "Фамилия"});
        expect(error).toBeVisible();
        expect(lastName).toHaveAttribute("aria-describedby", error.id);
        expect(lastName).toHaveFocus();
        expect(employeeService.create).not.toHaveBeenCalled();
    });

    it("keeps entered values after failure and closes only after a successful retry", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend employee detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(employeeService.create)
            .mockRejectedValueOnce(failure)
            .mockResolvedValueOnce({
                id: "employee-1",
                companyIds: [],
                userId: null,
                firstName: "Иван",
                lastName: "Иванов",
                patronymic: "Иванович",
                simpleName: null,
                position: EmployeePosition.WAITER_ACTIVE,
            });
        const {onClose, onSuccess} = renderModal();
        const dialog = await fillRequiredEmployeeFields(user);

        await user.click(within(dialog).getByRole("button", {name: "Создать"}));

        expect(await screen.findByText("Сотрудник не создан")).toBeVisible();
        expect(screen.getByText("Не удалось выполнить действие. Попробуйте ещё раз")).toBeVisible();
        expect(screen.queryByText(/backend employee detail/)).not.toBeInTheDocument();
        expect(screen.getByRole("dialog", {name: "Создание сотрудника"})).toBeVisible();
        expect(within(dialog).getByRole("textbox", {name: "Фамилия"})).toHaveValue("Иванов");
        expect(within(dialog).getByRole("button", {name: "Создать"})).toBeEnabled();
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:employeeCreate]", failure);

        await user.click(within(dialog).getByRole("button", {name: "Создать"}));

        expect(await screen.findByText("Сотрудник создан")).toBeVisible();
        expect(employeeService.create).toHaveBeenCalledTimes(2);
        expect(onSuccess).toHaveBeenCalledOnce();
        expect(onClose).toHaveBeenCalledOnce();
    });

    it("sends exactly one request while creation is pending", async () => {
        const user = userEvent.setup();
        let resolveCreate!: (employee: {
            id: string;
            companyIds: string[];
            userId: null;
            firstName: string;
            lastName: string;
            patronymic: string;
            simpleName: null;
            position: EmployeePosition;
        }) => void;
        vi.mocked(employeeService.create).mockReturnValue(new Promise((resolve) => {
            resolveCreate = resolve;
        }));
        renderModal();
        const dialog = await fillRequiredEmployeeFields(user);

        await user.click(within(dialog).getByRole("button", {name: "Создать"}));

        const pending = within(dialog).getByRole("button", {name: "Сотрудник создаётся"});
        expect(pending).toBeDisabled();
        await user.click(pending);
        expect(employeeService.create).toHaveBeenCalledOnce();

        resolveCreate({
            id: "employee-1",
            companyIds: [],
            userId: null,
            firstName: "Иван",
            lastName: "Иванов",
            patronymic: "Иванович",
            simpleName: null,
            position: EmployeePosition.WAITER_ACTIVE,
        });
        expect(await screen.findByText("Сотрудник создан")).toBeVisible();
    });
});

describe("Employee update", () => {
    it("keeps edits after failure and reports success only after a successful retry", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend update detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(employeeService.update)
            .mockRejectedValueOnce(failure)
            .mockResolvedValueOnce();
        const {onClose, onSuccess} = renderModal({
            initialData: {
                id: "employee-1",
                companyIds: ["company-1"],
                userId: null,
                firstName: "Иван",
                lastName: "Иванов",
                patronymic: "Иванович",
                simpleName: null,
                position: EmployeePosition.WAITER_ACTIVE,
            },
        });
        const dialog = screen.getByRole("dialog", {name: "Редактирование сотрудника"});
        const lastName = within(dialog).getByRole("textbox", {name: "Фамилия"});
        await user.clear(lastName);
        await user.type(lastName, "Петров");

        await user.click(within(dialog).getByRole("button", {name: "Сохранить"}));

        expect(await screen.findByText("Сотрудник не обновлён")).toBeVisible();
        expect(lastName).toHaveValue("Петров");
        expect(screen.getByRole("dialog", {name: "Редактирование сотрудника"})).toBeVisible();
        expect(onSuccess).not.toHaveBeenCalled();
        expect(onClose).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledWith("[feedback:employeeUpdate]", failure);

        await user.click(within(dialog).getByRole("button", {name: "Сохранить"}));

        expect(await screen.findByText("Сотрудник обновлён")).toBeVisible();
        expect(employeeService.update).toHaveBeenCalledTimes(2);
        expect(employeeService.update).toHaveBeenLastCalledWith("employee-1", expect.objectContaining({
            lastName: "Петров",
        }));
        expect(onSuccess).toHaveBeenCalledOnce();
        expect(onClose).toHaveBeenCalledOnce();
    });

    it("sends exactly one request while update is pending", async () => {
        const user = userEvent.setup();
        let resolveUpdate!: () => void;
        vi.mocked(employeeService.update).mockReturnValue(new Promise((resolve) => {
            resolveUpdate = resolve;
        }));
        renderModal({
            initialData: {
                id: "employee-1",
                companyIds: [],
                userId: null,
                firstName: "Иван",
                lastName: "Иванов",
                patronymic: "Иванович",
                simpleName: null,
                position: EmployeePosition.WAITER_ACTIVE,
            },
        });
        const dialog = screen.getByRole("dialog", {name: "Редактирование сотрудника"});

        await user.click(within(dialog).getByRole("button", {name: "Сохранить"}));

        const pending = within(dialog).getByRole("button", {name: "Сотрудник обновляется"});
        expect(pending).toBeDisabled();
        expect(within(dialog).getByRole("button", {name: "Отмена"})).toBeDisabled();
        await user.click(pending);
        expect(employeeService.update).toHaveBeenCalledOnce();

        resolveUpdate();
        expect(await screen.findByText("Сотрудник обновлён")).toBeVisible();
    });
});
