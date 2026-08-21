import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import CompanyDetailsPage from "@/app/(admin)/company/[id]/page";
import {Provider} from "@/components/ui/provider";
import {toaster} from "@/components/ui/toaster";
import {companyService} from "@/service/company/company.service";

const navigation = vi.hoisted(() => ({
    back: vi.fn(),
    push: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useParams: () => ({id: "company-1"}),
    useRouter: () => navigation,
}));

vi.mock("@/service/company/company.service", () => ({
    companyService: {
        getById: vi.fn(),
        update: vi.fn(),
        delete: vi.fn(),
    },
}));

const company = {
    id: "company-1",
    title: "Старая компания",
    employeeWageCoefficientFromRevenue: 350,
    defaultShiftStartTime: "09:00",
};

function renderPage() {
    render(
        <Provider defaultTheme="light">
            <CompanyDetailsPage />
        </Provider>,
    );
}

async function openEditDialog(user: ReturnType<typeof userEvent.setup>) {
    renderPage();
    await user.click(await screen.findByRole("button", {name: "Изменить"}));
    return screen.getByRole("dialog", {name: "Редактирование компании"});
}

async function openDeleteDialog(user: ReturnType<typeof userEvent.setup>) {
    renderPage();
    await user.click(await screen.findByRole("button", {name: "Удалить"}));
    return screen.getByRole("alertdialog", {name: "Удалить компанию?"});
}

beforeEach(() => {
    toaster.remove();
    navigation.back.mockReset();
    navigation.push.mockReset();
    vi.mocked(companyService.getById).mockReset();
    vi.mocked(companyService.getById).mockResolvedValue(company);
    vi.mocked(companyService.update).mockReset();
    vi.mocked(companyService.delete).mockReset();
});

afterEach(() => vi.restoreAllMocks());

describe("Company update", () => {
    it("keeps the edited value after failure and closes only after a successful retry", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend update detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(companyService.update)
            .mockRejectedValueOnce(failure)
            .mockResolvedValueOnce();
        const dialog = await openEditDialog(user);
        const title = within(dialog).getByRole("textbox", {name: "Название компании"});
        await user.clear(title);
        await user.type(title, "Обновлённая компания");

        await user.click(within(dialog).getByRole("button", {name: "Сохранить"}));

        expect(await screen.findByText("Компания не обновлена")).toBeVisible();
        expect(screen.getByText("Не удалось выполнить действие. Попробуйте ещё раз")).toBeVisible();
        expect(screen.queryByText(/backend update detail/)).not.toBeInTheDocument();
        expect(screen.getByRole("dialog", {name: "Редактирование компании"})).toBeVisible();
        expect(title).toHaveValue("Обновлённая компания");
        expect(within(dialog).getByRole("button", {name: "Сохранить"})).toBeEnabled();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:companyUpdate]", failure);

        await user.click(within(dialog).getByRole("button", {name: "Сохранить"}));

        expect(await screen.findByText("Компания обновлена")).toBeVisible();
        expect(companyService.update).toHaveBeenCalledTimes(2);
        expect(companyService.update).toHaveBeenLastCalledWith("company-1", {
            title: "Обновлённая компания",
            employeeWageCoefficientFromRevenue: 350,
            defaultShiftStartTime: "09:00",
        });
        await waitFor(() => expect(companyService.getById).toHaveBeenCalledTimes(2));
        await waitFor(() => expect(screen.queryByRole("dialog", {
            name: "Редактирование компании",
        })).not.toBeInTheDocument());
    });

    it("sends exactly one update while pending", async () => {
        const user = userEvent.setup();
        let resolveUpdate!: () => void;
        vi.mocked(companyService.update).mockReturnValue(new Promise((resolve) => {
            resolveUpdate = resolve;
        }));
        const dialog = await openEditDialog(user);

        await user.click(within(dialog).getByRole("button", {name: "Сохранить"}));

        const pending = within(dialog).getByRole("button", {name: "Компания обновляется"});
        expect(pending).toBeDisabled();
        await user.click(pending);
        expect(companyService.update).toHaveBeenCalledOnce();

        resolveUpdate();
        expect(await screen.findByText("Компания обновлена")).toBeVisible();
    });
});

describe("Company detail deletion", () => {
    it("uses the shared alert dialog and cancels without deleting", async () => {
        const user = userEvent.setup();
        const nativeConfirm = vi.spyOn(window, "confirm");
        const dialog = await openDeleteDialog(user);

        expect(dialog).toBeVisible();
        expect(screen.getByText("Компания «Старая компания» будет удалена без возможности восстановления.")).toBeVisible();
        expect(nativeConfirm).not.toHaveBeenCalled();
        await user.click(within(dialog).getByRole("button", {name: "Отмена"}));

        expect(companyService.delete).not.toHaveBeenCalled();
        expect(navigation.push).not.toHaveBeenCalled();
    });

    it("prevents repeated deletion and redirects after success", async () => {
        const user = userEvent.setup();
        let resolveDelete!: () => void;
        vi.mocked(companyService.delete).mockReturnValue(new Promise((resolve) => {
            resolveDelete = resolve;
        }));
        const dialog = await openDeleteDialog(user);

        await user.click(within(dialog).getByRole("button", {name: "Удалить"}));

        const pending = screen.getByRole("button", {name: "Компания удаляется"});
        expect(pending).toBeDisabled();
        await user.click(pending);
        expect(companyService.delete).toHaveBeenCalledOnce();
        expect(companyService.delete).toHaveBeenCalledWith("company-1");
        expect(navigation.push).not.toHaveBeenCalled();

        resolveDelete();
        expect(await screen.findByText("Компания удалена")).toBeVisible();
        expect(navigation.push).toHaveBeenCalledOnce();
        expect(navigation.push).toHaveBeenCalledWith("/company");
    });

    it("keeps failure recoverable without redirecting", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend deletion detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(companyService.delete).mockRejectedValue(failure);
        const dialog = await openDeleteDialog(user);

        await user.click(within(dialog).getByRole("button", {name: "Удалить"}));

        expect(await screen.findByText("Компания не удалена")).toBeVisible();
        expect(screen.getByText("Не удалось выполнить действие. Попробуйте ещё раз")).toBeVisible();
        expect(screen.getByRole("alertdialog")).toBeVisible();
        expect(screen.getByRole("button", {name: "Удалить"})).toBeEnabled();
        expect(screen.getByRole("button", {name: "Отмена"})).toBeEnabled();
        expect(navigation.push).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:companyDelete]", failure);
    });
});
