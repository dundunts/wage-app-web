import {act, render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import EmployeeDetailPage from "@/app/(admin)/employee/[id]/page";
import {Provider} from "@/components/ui/provider";
import {toaster} from "@/feedback/toast-store";
import {employeeService} from "@/service/employee/employee.service";
import {EmployeePosition} from "@/types/employee.types";

const navigation = vi.hoisted(() => ({push: vi.fn()}));

vi.mock("next/navigation", () => ({
    useRouter: () => navigation,
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
        getById: vi.fn(),
        create: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

const employee = {
    id: "employee-1",
    companyIds: ["company-1"],
    userId: null,
    firstName: "Иван",
    lastName: "Иванов",
    patronymic: "Иванович",
    simpleName: null,
    position: EmployeePosition.WAITER_ACTIVE,
};

async function renderPage() {
    await act(async () => {
        render(
            <Provider defaultTheme="light">
                <EmployeeDetailPage params={Promise.resolve({id: "employee-1"})} />
            </Provider>,
        );
    });
}

async function openDeleteDialog(user: ReturnType<typeof userEvent.setup>) {
    await renderPage();
    await user.click(await screen.findByRole("button", {name: "Удалить"}));
    return screen.getByRole("alertdialog", {name: "Удалить сотрудника?"});
}

beforeEach(() => {
    toaster.remove();
    navigation.push.mockReset();
    vi.mocked(employeeService.getById).mockReset();
    vi.mocked(employeeService.getById).mockResolvedValue(employee);
    vi.mocked(employeeService.delete).mockReset();
});

afterEach(() => vi.restoreAllMocks());

describe("Employee detail deletion", () => {
    it("uses the shared alert dialog and cancels without a request", async () => {
        const user = userEvent.setup();
        const nativeConfirm = vi.spyOn(window, "confirm");
        const dialog = await openDeleteDialog(user);

        expect(dialog).toBeVisible();
        expect(screen.getByText("Сотрудник «Иванов Иван Иванович» будет удалён без возможности восстановления.")).toBeVisible();
        expect(nativeConfirm).not.toHaveBeenCalled();
        await user.click(within(dialog).getByRole("button", {name: "Отмена"}));

        expect(employeeService.delete).not.toHaveBeenCalled();
        expect(navigation.push).not.toHaveBeenCalled();
        await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    });

    it("prevents repeated deletion and redirects after success", async () => {
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
        expect(navigation.push).not.toHaveBeenCalled();

        resolveDelete();
        expect(await screen.findByText("Сотрудник удалён")).toBeVisible();
        expect(navigation.push).toHaveBeenCalledOnce();
        expect(navigation.push).toHaveBeenCalledWith("/employee");
    });

    it("keeps failure recoverable without redirecting", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend deletion detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(employeeService.delete).mockRejectedValue(failure);
        const dialog = await openDeleteDialog(user);

        await user.click(within(dialog).getByRole("button", {name: "Удалить"}));

        expect(await screen.findByText("Сотрудник не удалён")).toBeVisible();
        expect(screen.getByText("Не удалось выполнить действие. Попробуйте ещё раз")).toBeVisible();
        expect(screen.getByRole("alertdialog")).toBeVisible();
        expect(screen.getByRole("button", {name: "Удалить"})).toBeEnabled();
        expect(screen.getByRole("button", {name: "Отмена"})).toBeEnabled();
        expect(navigation.push).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:employeeDelete]", failure);
    });
});
