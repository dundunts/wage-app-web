import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {AxiosError, AxiosHeaders} from "axios";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {Provider} from "@/components/ui/provider";
import {ShiftResultModal} from "@/components/results/ShiftResultModal";
import {shiftResultService} from "@/service/results/shiftResult.service";
import {employeeService} from "@/service/employee/employee.service";
import {toaster} from "@/feedback/toast-store";
import {deferred} from "@/test/deferred";
import {EmployeePosition} from "@/types/employee.types";
import {CalculationSource} from "@/types/shiftResult.types";

vi.mock("@/service/results/shiftResult.service", () => ({
    shiftResultService: {save: vi.fn()},
}));

vi.mock("@/service/employee/employee.service", () => ({
    employeeService: {getCoworkersForCompany: vi.fn()},
}));

const companies = [{
    id: "company-1",
    title: "Компания",
    employeeWageCoefficientFromRevenue: 0.4,
    defaultShiftStartTime: "09:00",
}];

const employees = [
    {id: "employee-1", firstName: "Иван", lastName: "Иванов"},
    {id: "employee-2", firstName: "Анна", lastName: "Петрова"},
].map(employee => ({
    ...employee,
    patronymic: "",
    simpleName: null,
    userId: null,
    position: EmployeePosition.WAITER_ACTIVE,
}));

function mockVisibleLayout() {
    // jsdom has no layout; hideWhenDetached needs a non-empty viewport and anchor.
    vi.spyOn(Element.prototype, "getBoundingClientRect").mockReturnValue(new DOMRect(0, 0, 1024, 768));
    vi.spyOn(HTMLElement.prototype, "clientWidth", "get").mockReturnValue(1024);
    vi.spyOn(HTMLElement.prototype, "clientHeight", "get").mockReturnValue(768);
    vi.stubGlobal("IntersectionObserver", class {
        observe() {}
        unobserve() {}
        disconnect() {}
    });
}

function renderModal(overrides: Partial<React.ComponentProps<typeof ShiftResultModal>> = {}) {
    const props: React.ComponentProps<typeof ShiftResultModal> = {
        isOpen: true,
        onClose: vi.fn(),
        onSuccess: vi.fn(),
        companies,
        initialData: null,
        ...overrides,
    };

    render(
        <Provider defaultTheme="light">
            <ShiftResultModal {...props} />
        </Provider>,
    );

    return props;
}

describe("ShiftResultModal save flow", () => {
    beforeEach(() => {
        toaster.remove();
        vi.mocked(employeeService.getCoworkersForCompany).mockResolvedValue([]);
        vi.mocked(shiftResultService.save).mockReset();
    });

    afterEach(() => {
        vi.restoreAllMocks();
        vi.unstubAllGlobals();
    });

    it("associates the Company and Payment employee Select controls with their labels", async () => {
        const user = userEvent.setup();
        renderModal();

        expect(screen.getByRole("combobox", {name: "Компания"})).toBeVisible();
        await user.click(screen.getByRole("button", {name: /Добавить/}));
        expect(screen.getByRole("combobox", {name: "Сотрудник 1"})).toBeVisible();
    });

    it("shows the agreed success feedback and completes the dialog flow", async () => {
        const user = userEvent.setup();
        vi.mocked(shiftResultService.save).mockResolvedValue({resultId: "result-1"});
        const props = renderModal();

        await user.click(screen.getByRole("button", {name: "Создать"}));

        expect(await screen.findByText("Результат смены сохранён")).toBeVisible();
        expect(shiftResultService.save).toHaveBeenCalledTimes(1);
        expect(props.onSuccess).toHaveBeenCalledTimes(1);
        expect(props.onClose).toHaveBeenCalledTimes(1);
    });

    it("changes an employee inside the edit dialog and saves the selected employee ID", async () => {
        mockVisibleLayout();
        const user = userEvent.setup();
        vi.mocked(employeeService.getCoworkersForCompany).mockResolvedValue(employees);
        vi.mocked(shiftResultService.save).mockResolvedValue({resultId: "result-1"});
        const props = renderModal({
            initialData: {
                companyId: "company-1",
                result: {
                    id: "result-1",
                    date: new Date("2026-08-20"),
                    sessionId: null,
                    calculationSource: CalculationSource.MANUAL_OVERRIDE,
                    payments: [{
                        id: "payment-1",
                        employee: employees[0],
                        percentFromRevenue: 1200,
                        tips: 300,
                        workSeconds: 28800,
                    }],
                },
            },
        });
        const dialog = screen.getByRole("dialog");
        const employee = within(dialog).getByRole("combobox", {name: "Сотрудник 1"});
        expect(within(dialog).getByRole("combobox", {name: "Компания"})).toBeDisabled();
        await waitFor(() => expect(employee).toBeEnabled());

        await user.click(employee);
        const list = await within(dialog).findByRole("listbox", {name: "Сотрудник 1"});
        await user.click(within(list).getByRole("option", {name: "Петрова Анна"}));

        expect(employee).toHaveTextContent("Петрова Анна");
        expect(dialog).toBeVisible();
        expect(props.onClose).not.toHaveBeenCalled();
        await user.click(within(dialog).getByRole("button", {name: "Сохранить изменения"}));
        await waitFor(() => expect(shiftResultService.save).toHaveBeenCalledWith({
            companyId: "company-1",
            overwrite: true,
            date: new Date("2026-08-20"),
            payments: [{
                employeeId: "employee-2",
                percentFromRevenue: 1200,
                tips: 300,
                workSeconds: 28800,
            }],
        }));
    });

    it("selects a company and an employee in a new payment and dismisses only the menu on Escape", async () => {
        mockVisibleLayout();
        const user = userEvent.setup();
        vi.mocked(employeeService.getCoworkersForCompany).mockResolvedValue(employees);
        vi.mocked(shiftResultService.save).mockResolvedValue({resultId: "result-2"});
        const props = renderModal({
            companies: [...companies, {...companies[0], id: "company-2", title: "Вторая точка"}],
        });
        const dialog = screen.getByRole("dialog");
        const company = within(dialog).getByRole("combobox", {name: "Компания"});
        await user.click(company);
        const companiesList = await within(dialog).findByRole("listbox", {name: "Компания"});
        await user.click(within(companiesList).getByRole("option", {name: "Вторая точка"}));
        expect(company).toHaveTextContent("Вторая точка");
        await waitFor(() => expect(employeeService.getCoworkersForCompany).toHaveBeenLastCalledWith("company-2"));

        await user.click(within(dialog).getByRole("button", {name: /Добавить/}));
        const employee = within(dialog).getByRole("combobox", {name: "Сотрудник 1"});
        await waitFor(() => expect(employee).toBeEnabled());
        await user.click(employee);
        const employeesList = await within(dialog).findByRole("listbox", {name: "Сотрудник 1"});
        await waitFor(() => expect(employeesList).toHaveFocus());
        await user.keyboard("{Escape}");
        await waitFor(() => expect(employee).toHaveAttribute("aria-expanded", "false"));
        await waitFor(() => expect(employee).toHaveFocus());
        expect(props.onClose).not.toHaveBeenCalled();

        await user.keyboard("{ArrowDown}");
        await waitFor(() => expect(employeesList).toHaveFocus());
        await user.keyboard("{End}");
        await user.keyboard("{Enter}");
        await waitFor(() => expect(employee).toHaveTextContent("Петрова Анна"));
        await user.click(within(dialog).getByRole("button", {name: "Создать"}));
        await waitFor(() => expect(shiftResultService.save).toHaveBeenCalledWith(expect.objectContaining({
            companyId: "company-2",
            overwrite: false,
            payments: [{employeeId: "employee-2", percentFromRevenue: 0, tips: 0, workSeconds: 0}],
        })));
    });

    it("shows safe conflict feedback and keeps the entered form recoverable", async () => {
        const user = userEvent.setup();
        const conflict = new AxiosError(
            "Request failed",
            undefined,
            undefined,
            undefined,
            {
                status: 409,
                statusText: "Conflict",
                headers: {},
                config: {headers: new AxiosHeaders()},
                data: {
                    status: 409,
                    detail: "Employee 5c62ab70-8526-4ee9-a4ec-c66d1fd8915f is duplicated",
                },
            },
        );
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(shiftResultService.save)
            .mockRejectedValueOnce(conflict)
            .mockResolvedValueOnce({resultId: "result-1"});
        const props = renderModal();
        const date = screen.getByLabelText(/^Дата/);
        await user.clear(date);
        await user.type(date, "2026-08-20");

        await user.click(screen.getByRole("button", {name: "Создать"}));

        expect(await screen.findByText("Результат смены не сохранён")).toBeVisible();
        expect(screen.getByText(
            "Возник конфликт данных. Проверьте выбранную дату и список сотрудников",
        )).toBeVisible();
        expect(screen.getByRole("region", {name: /Notifications/})).toHaveAttribute(
            "aria-live",
            "polite",
        );
        expect(screen.queryByText(/5c62ab70/)).not.toBeInTheDocument();
        expect(date).toHaveValue("2026-08-20");
        expect(screen.getByRole("dialog")).toBeVisible();
        expect(screen.getByRole("button", {name: "Создать"})).toBeEnabled();
        expect(props.onClose).not.toHaveBeenCalled();
        expect(props.onSuccess).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalledWith("[feedback:shiftResultSave]", conflict);

        await user.click(screen.getByRole("button", {name: "Создать"}));
        expect(await screen.findByText("Результат смены сохранён")).toBeVisible();
        expect(shiftResultService.save).toHaveBeenCalledTimes(2);
    });

    it("shows the existing required validation inline and does not send a request", async () => {
        const user = userEvent.setup();
        renderModal();
        await user.clear(screen.getByLabelText(/^Дата/));

        await user.click(screen.getByRole("button", {name: "Создать"}));

        const error = await screen.findByText("Укажите дату");
        expect(error).toBeVisible();
        expect(screen.getByLabelText(/^Дата/)).toHaveAttribute("aria-describedby", error.id);
        expect(screen.getByLabelText(/^Дата/)).toHaveFocus();
        expect(shiftResultService.save).not.toHaveBeenCalled();
    });

    it("shows an inline error for the declared required employee selection", async () => {
        const user = userEvent.setup();
        renderModal();
        await user.click(screen.getByRole("button", {name: /Добавить/}));

        await user.click(screen.getByRole("button", {name: "Создать"}));

        const error = await screen.findByText("Выберите сотрудника");
        const employee = screen.getByRole("combobox", {name: "Сотрудник 1"});
        expect(error).toBeVisible();
        expect(employee).toHaveAttribute("aria-describedby", error.id);
        expect(employee).toHaveFocus();
        expect(shiftResultService.save).not.toHaveBeenCalled();
    });

    it("sends one request when submit is clicked repeatedly while pending", async () => {
        const user = userEvent.setup();
        const save = deferred<{resultId: string}>();
        vi.mocked(shiftResultService.save).mockReturnValue(save.promise);
        const props = renderModal();
        const submit = screen.getByRole("button", {name: "Создать"});
        const cancel = screen.getByRole("button", {name: "Отмена"});

        await user.click(submit);
        expect(submit).toBeDisabled();
        expect(cancel).toBeDisabled();
        await user.click(submit);
        await user.click(cancel);

        expect(shiftResultService.save).toHaveBeenCalledTimes(1);
        expect(props.onClose).not.toHaveBeenCalled();
        save.resolve({resultId: "result-1"});
        expect(await screen.findByText("Результат смены сохранён")).toBeVisible();
    });
});
