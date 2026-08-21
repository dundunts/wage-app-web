import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {CompanyList} from "@/components/company/company-list";
import {Provider} from "@/components/ui/provider";
import {toaster} from "@/feedback/toast-store";
import {companyService} from "@/service/company/company.service";

vi.mock("next/navigation", () => ({
    useRouter: () => ({push: vi.fn()}),
    usePathname: () => "/company",
    useSearchParams: () => new URLSearchParams(),
}));

vi.mock("@/service/company/company.service", () => ({
    companyService: {
        create: vi.fn(),
        delete: vi.fn(),
    },
}));

const company = {
    id: "company-1",
    title: "Старая компания",
    employeeWageCoefficientFromRevenue: 350,
    defaultShiftStartTime: "09:00",
};

const companiesPage = {
    content: [company],
    totalElements: 1,
    totalPages: 1,
    size: 10,
    number: 0,
};

function renderList(onRefresh = vi.fn()) {
    render(
        <Provider defaultTheme="light">
            <CompanyList data={companiesPage} isLoadingData={false} onRefresh={onRefresh} />
        </Provider>,
    );
    return onRefresh;
}

async function openCreateDialog(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", {name: "Создать компанию"}));
    return screen.getByRole("dialog", {name: "Создание компании"});
}

async function openDeleteDialog(user: ReturnType<typeof userEvent.setup>) {
    await user.click(screen.getByRole("button", {name: "Опции компании «Старая компания»"}));
    await user.click(screen.getByRole("menuitem", {name: "Удалить"}));
    return screen.getByRole("alertdialog", {name: "Удалить компанию?"});
}

beforeEach(() => {
    toaster.remove();
    vi.mocked(companyService.create).mockReset();
    vi.mocked(companyService.delete).mockReset();
});

afterEach(() => vi.restoreAllMocks());

describe("Company creation", () => {
    it("shows the existing required title validation inline without a request", async () => {
        const user = userEvent.setup();
        renderList();
        const dialog = await openCreateDialog(user);

        await user.click(within(dialog).getByRole("button", {name: "Создать"}));

        const error = await screen.findByText("Название обязательно для заполнения");
        const title = within(dialog).getByRole("textbox", {name: "Название компании"});
        expect(error).toBeVisible();
        expect(title).toHaveAttribute("aria-describedby", error.id);
        expect(title).toHaveFocus();
        expect(companyService.create).not.toHaveBeenCalled();
    });

    it("keeps entered values after failure and retries from the open dialog", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend company detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(companyService.create)
            .mockRejectedValueOnce(failure)
            .mockResolvedValueOnce({...company, title: "Новая компания"});
        const onRefresh = renderList();
        const dialog = await openCreateDialog(user);
        const title = within(dialog).getByRole("textbox", {name: "Название компании"});
        await user.type(title, "Новая компания");

        await user.click(within(dialog).getByRole("button", {name: "Создать"}));

        expect(await screen.findByText("Компания не создана")).toBeVisible();
        expect(screen.getByText("Не удалось выполнить действие. Попробуйте ещё раз")).toBeVisible();
        expect(screen.queryByText(/backend company detail/)).not.toBeInTheDocument();
        expect(screen.getByRole("dialog", {name: "Создание компании"})).toBeVisible();
        expect(title).toHaveValue("Новая компания");
        expect(within(dialog).getByRole("button", {name: "Создать"})).toBeEnabled();
        expect(onRefresh).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:companyCreate]", failure);

        await user.click(within(dialog).getByRole("button", {name: "Создать"}));

        expect(await screen.findByText("Компания создана")).toBeVisible();
        expect(companyService.create).toHaveBeenCalledTimes(2);
        expect(onRefresh).toHaveBeenCalledOnce();
        expect(screen.queryByRole("dialog", {name: "Создание компании"})).not.toBeInTheDocument();
    });

    it("sends exactly one request while creation is pending", async () => {
        const user = userEvent.setup();
        let resolveCreate!: (value: typeof company) => void;
        vi.mocked(companyService.create).mockReturnValue(new Promise((resolve) => {
            resolveCreate = resolve;
        }));
        renderList();
        const dialog = await openCreateDialog(user);
        await user.type(within(dialog).getByRole("textbox", {name: "Название компании"}), "Новая");

        await user.click(within(dialog).getByRole("button", {name: "Создать"}));

        const pending = within(dialog).getByRole("button", {name: "Компания создаётся"});
        expect(pending).toBeDisabled();
        await user.click(pending);
        expect(companyService.create).toHaveBeenCalledOnce();

        resolveCreate({...company, title: "Новая"});
        expect(await screen.findByText("Компания создана")).toBeVisible();
    });
});

describe("Company list deletion", () => {
    it("uses the shared alert dialog and cancels without a request", async () => {
        const user = userEvent.setup();
        const nativeConfirm = vi.spyOn(window, "confirm");
        renderList();

        const dialog = await openDeleteDialog(user);

        expect(dialog).toBeVisible();
        expect(screen.getByText("Компания «Старая компания» будет удалена без возможности восстановления.")).toBeVisible();
        expect(nativeConfirm).not.toHaveBeenCalled();
        await user.click(within(dialog).getByRole("button", {name: "Отмена"}));

        expect(companyService.delete).not.toHaveBeenCalled();
        await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    });

    it("prevents repeated deletion and refetches after success", async () => {
        const user = userEvent.setup();
        let resolveDelete!: () => void;
        vi.mocked(companyService.delete).mockReturnValue(new Promise((resolve) => {
            resolveDelete = resolve;
        }));
        const onRefresh = renderList();
        const dialog = await openDeleteDialog(user);

        await user.click(within(dialog).getByRole("button", {name: "Удалить"}));

        const pending = screen.getByRole("button", {name: "Компания удаляется"});
        expect(pending).toBeDisabled();
        await user.click(pending);
        expect(companyService.delete).toHaveBeenCalledOnce();
        expect(companyService.delete).toHaveBeenCalledWith("company-1");

        resolveDelete();
        expect(await screen.findByText("Компания удалена")).toBeVisible();
        await waitFor(() => expect(onRefresh).toHaveBeenCalledOnce());
        await waitFor(() => expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument());
    });

    it("keeps failed deletion recoverable", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend deletion detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(companyService.delete)
            .mockRejectedValueOnce(failure)
            .mockResolvedValueOnce();
        const onRefresh = renderList();
        await openDeleteDialog(user);

        await user.click(screen.getByRole("button", {name: "Удалить"}));

        expect(await screen.findByText("Компания не удалена")).toBeVisible();
        expect(screen.getByRole("alertdialog")).toBeVisible();
        expect(screen.getByRole("button", {name: "Удалить"})).toBeEnabled();
        expect(screen.getByRole("button", {name: "Отмена"})).toBeEnabled();
        expect(onRefresh).not.toHaveBeenCalled();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:companyDelete]", failure);

        await user.click(screen.getByRole("button", {name: "Удалить"}));
        expect(await screen.findByText("Компания удалена")).toBeVisible();
        expect(companyService.delete).toHaveBeenCalledTimes(2);
    });
});
