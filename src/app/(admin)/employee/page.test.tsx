import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import EmployeeListPage from "@/app/(admin)/employee/page";
import {Provider} from "@/components/ui/provider";
import {toaster} from "@/feedback/toast-store";
import {employeeService} from "@/service/employee/employee.service";
import {EmployeePosition} from "@/types/employee.types";

vi.mock("next/navigation", () => ({
    useRouter: () => ({push: vi.fn()}),
}));

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
        getByCompanies: vi.fn(),
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
    simpleName: null,
    position: EmployeePosition.WAITER_ACTIVE,
};

function renderPage() {
    render(
        <Provider defaultTheme="light">
            <EmployeeListPage />
        </Provider>,
    );
}

async function openDeleteDialog(user: ReturnType<typeof userEvent.setup>) {
    renderPage();
    await screen.findByText("Иванов И. И.");
    await user.click(screen.getByRole("button", {name: "Опции"}));
    await user.click(screen.getByRole("menuitem", {name: "Удалить"}));
    return screen.getByRole("alertdialog", {name: "Удалить сотрудника?"});
}

beforeEach(() => {
    toaster.remove();
    vi.mocked(employeeService.getByCompanies).mockReset();
    vi.mocked(employeeService.getByCompanies).mockResolvedValue([{companyId: "company-1", data: [employee]}]);
    vi.mocked(employeeService.delete).mockReset();
});

afterEach(() => vi.restoreAllMocks());

describe("Employee list deletion", () => {
    it("uses the shared alert dialog and cancels without a request", async () => {
        const user = userEvent.setup();
        const nativeConfirm = vi.spyOn(window, "confirm");
        const dialog = await openDeleteDialog(user);

        expect(dialog).toBeVisible();
        expect(screen.getByText("Сотрудник «Иванов Иван Иванович» будет удалён без возможности восстановления.")).toBeVisible();
        expect(nativeConfirm).not.toHaveBeenCalled();
        await user.click(within(dialog).getByRole("button", {name: "Отмена"}));

        expect(employeeService.delete).not.toHaveBeenCalled();
        await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    });

    it("prevents repeated deletion and refetches after success", async () => {
        const user = userEvent.setup();
        let resolveDelete!: () => void;
        vi.mocked(employeeService.delete).mockReturnValue(new Promise((resolve) => {
            resolveDelete = resolve;
        }));
        const dialog = await openDeleteDialog(user);

        await user.click(within(dialog).getByRole("button", {name: "Удалить"}));

        const pending = screen.getByRole("button", {name: "Сотрудник удаляется"});
        expect(pending).toBeDisabled();
        await user.click(pending);
        expect(employeeService.delete).toHaveBeenCalledOnce();
        expect(employeeService.delete).toHaveBeenCalledWith("employee-1");

        resolveDelete();
        expect(await screen.findByText("Сотрудник удалён")).toBeVisible();
        await waitFor(() => expect(employeeService.getByCompanies).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    });

    it("keeps failed deletion recoverable for retry or cancel", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend deletion detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(employeeService.delete)
            .mockRejectedValueOnce(failure)
            .mockResolvedValueOnce();
        await openDeleteDialog(user);

        await user.click(screen.getByRole("button", {name: "Удалить"}));

        expect(await screen.findByText("Сотрудник не удалён")).toBeVisible();
        expect(screen.getByText("Не удалось выполнить действие. Попробуйте ещё раз")).toBeVisible();
        expect(screen.getByRole("alertdialog")).toBeVisible();
        expect(screen.getByRole("button", {name: "Удалить"})).toBeEnabled();
        expect(screen.getByRole("button", {name: "Отмена"})).toBeEnabled();
        expect(employeeService.getByCompanies).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:employeeDelete]", failure);

        await user.click(screen.getByRole("button", {name: "Удалить"}));
        expect(await screen.findByText("Сотрудник удалён")).toBeVisible();
        expect(employeeService.delete).toHaveBeenCalledTimes(2);
    });
});
