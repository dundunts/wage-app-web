import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import ResultsPage from "@/app/(main)/results/page";
import {Provider} from "@/components/ui/provider";
import {toaster} from "@/feedback/toast-store";
import {companyService} from "@/service/company/company.service";
import {shiftResultService} from "@/service/results/shiftResult.service";
import {salaryService} from "@/service/salary/salary.service";
import {CalculationSource} from "@/types/shiftResult.types";
import {downloadFile} from "@/utils/download-file";
import {ApplicationError} from "@/feedback/api-error";

const searchParams = new URLSearchParams("companyId=company-1");
const navigation = vi.hoisted(() => ({push: vi.fn()}));

vi.mock("next/navigation", () => ({
    useRouter: () => navigation,
    usePathname: () => "/results",
    useSearchParams: () => searchParams,
}));

vi.mock("@/service/company/company.service", () => ({
    companyService: {getForUser: vi.fn()},
}));

vi.mock("@/service/results/shiftResult.service", () => ({
    shiftResultService: {
        getPageByPeriod: vi.fn(),
        delete: vi.fn(),
    },
}));

vi.mock("@/service/salary/salary.service", () => ({
    salaryService: {downloadReportTable: vi.fn()},
}));

vi.mock("@/utils/download-file", () => ({
    downloadFile: vi.fn(),
}));

const company = {
    id: "company-1",
    title: "Компания",
    employeeWageCoefficientFromRevenue: 0.4,
    defaultShiftStartTime: "09:00",
};

const result = {
    id: "result-1",
    date: new Date("2026-08-21"),
    sessionId: null,
    calculationSource: CalculationSource.MANUAL_OVERRIDE,
    payments: [],
};

const resultsPage = {
    content: [result],
    totalElements: 1,
    totalPages: 1,
    size: 30,
    number: 0,
};

function renderPage() {
    render(
        <Provider defaultTheme="light">
            <ResultsPage />
        </Provider>,
    );
}

async function openDeleteDialog(user: ReturnType<typeof userEvent.setup>) {
    renderPage();
    const actions = await screen.findByRole("button", {name: "Опции"});
    await user.click(actions);
    await user.click(screen.getByRole("menuitem", {name: "Удалить"}));
    return actions;
}

beforeEach(() => {
    toaster.remove();
    vi.mocked(companyService.getForUser).mockReset();
    vi.mocked(companyService.getForUser).mockResolvedValue([company]);
    vi.mocked(shiftResultService.getPageByPeriod).mockReset();
    vi.mocked(shiftResultService.getPageByPeriod).mockResolvedValue(resultsPage);
});

afterEach(() => vi.restoreAllMocks());

describe("Shift Result list deletion", () => {
    beforeEach(() => {
        vi.mocked(shiftResultService.delete).mockReset();
    });

    it("cancels without a request and returns focus to the row actions", async () => {
        const user = userEvent.setup();
        const actions = await openDeleteDialog(user);

        const dialog = screen.getByRole("alertdialog", {
            name: "Удалить результат смены?",
        });
        expect(dialog).toBeVisible();
        expect(screen.getByText("Результат смены будет удалён без возможности восстановления.")).toBeVisible();
        await waitFor(() => expect(dialog).toContainElement(document.activeElement as HTMLElement));

        await user.click(screen.getByRole("button", {name: "Отмена"}));

        expect(shiftResultService.delete).not.toHaveBeenCalled();
        await waitFor(() => expect(actions).toHaveFocus());
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("traps keyboard focus and closes with Escape when idle", async () => {
        const user = userEvent.setup();
        const actions = await openDeleteDialog(user);
        const dialog = screen.getByRole("alertdialog");

        await user.tab();
        expect(dialog).toContainElement(document.activeElement as HTMLElement);
        await user.tab({shift: true});
        expect(dialog).toContainElement(document.activeElement as HTMLElement);

        await user.keyboard("{Escape}");

        expect(shiftResultService.delete).not.toHaveBeenCalled();
        await waitFor(() => expect(actions).toHaveFocus());
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });

    it("shows pending and sends exactly one request for repeated confirmation", async () => {
        const user = userEvent.setup();
        let resolveDelete!: () => void;
        vi.mocked(shiftResultService.delete).mockReturnValue(new Promise((resolve) => {
            resolveDelete = resolve;
        }));
        await openDeleteDialog(user);

        await user.click(screen.getByRole("button", {name: "Удалить"}));

        const pending = screen.getByRole("button", {name: "Результат смены удаляется"});
        expect(pending).toBeDisabled();
        expect(screen.getByRole("button", {name: "Отмена"})).toBeDisabled();
        await user.click(pending);
        await user.keyboard("{Escape}");
        expect(screen.getByRole("alertdialog")).toBeVisible();
        expect(shiftResultService.delete).toHaveBeenCalledOnce();
        expect(shiftResultService.delete).toHaveBeenCalledWith("result-1");

        resolveDelete();
        expect(await screen.findByText("Результат смены удалён")).toBeVisible();
    });

    it("shows success, closes the dialog, and refetches the list", async () => {
        const user = userEvent.setup();
        vi.mocked(shiftResultService.delete).mockResolvedValue();
        await openDeleteDialog(user);
        const fetchesBeforeDelete = vi.mocked(shiftResultService.getPageByPeriod).mock.calls.length;

        await user.click(screen.getByRole("button", {name: "Удалить"}));

        expect(await screen.findByText("Результат смены удалён")).toBeVisible();
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
        await waitFor(() => expect(shiftResultService.getPageByPeriod).toHaveBeenCalledTimes(
            fetchesBeforeDelete + 1,
        ));
    });

    it("shows safe failure feedback and keeps the dialog open for retry", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend deletion detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(shiftResultService.delete)
            .mockRejectedValueOnce(failure)
            .mockResolvedValueOnce();
        await openDeleteDialog(user);

        await user.click(screen.getByRole("button", {name: "Удалить"}));

        expect(await screen.findByText("Результат смены не удалён")).toBeVisible();
        expect(screen.getByText("Не удалось выполнить действие. Попробуйте ещё раз")).toBeVisible();
        expect(screen.queryByText(/backend deletion detail/)).not.toBeInTheDocument();
        expect(screen.getByRole("alertdialog")).toBeVisible();
        expect(screen.getByRole("button", {name: "Удалить"})).toBeEnabled();
        expect(screen.getByRole("button", {name: "Отмена"})).toBeEnabled();
        expect(consoleError).toHaveBeenCalledTimes(1);
        expect(consoleError).toHaveBeenCalledWith("[feedback:shiftResultDelete]", failure);

        await user.click(screen.getByRole("button", {name: "Удалить"}));

        expect(await screen.findByText("Результат смены удалён")).toBeVisible();
        expect(shiftResultService.delete).toHaveBeenCalledTimes(2);
        expect(screen.queryByRole("alertdialog")).not.toBeInTheDocument();
    });
});

describe("Payroll Excel download", () => {
    beforeEach(() => {
        vi.mocked(salaryService.downloadReportTable).mockReset();
        vi.mocked(downloadFile).mockReset();
    });

    it("keeps loading visible, prevents repetition, and resolves to a downloaded file", async () => {
        const user = userEvent.setup();
        const blob = new Blob(["payroll"]);
        let resolveDownload!: (value: Blob) => void;
        vi.mocked(salaryService.downloadReportTable).mockReturnValue(new Promise((resolve) => {
            resolveDownload = resolve;
        }));
        renderPage();
        const download = await screen.findByRole("button", {name: "Скачать Excel"});

        await user.click(download);

        expect(await screen.findByRole("status")).toHaveTextContent("Excel-отчёт формируется");
        expect(screen.getByRole("button", {name: "Excel-отчёт формируется"})).toBeDisabled();
        await user.click(screen.getByRole("button", {name: "Excel-отчёт формируется"}));
        expect(salaryService.downloadReportTable).toHaveBeenCalledOnce();

        resolveDownload(blob);

        expect(await screen.findByText("Excel-отчёт скачан")).toBeVisible();
        expect(downloadFile).toHaveBeenCalledOnce();
        expect(downloadFile).toHaveBeenCalledWith(blob, "salary-report.xlsx");
        await waitFor(() => expect(download).toBeEnabled());
    });

    it("shows a safe failure and retries one request with the same parameters", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend export detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const blob = new Blob(["payroll retry"]);
        let resolveRetry!: (value: Blob) => void;
        vi.mocked(salaryService.downloadReportTable)
            .mockRejectedValueOnce(failure)
            .mockReturnValueOnce(new Promise((resolve) => {
                resolveRetry = resolve;
            }));
        renderPage();

        await user.click(await screen.findByRole("button", {name: "Скачать Excel"}));

        expect(await screen.findByText("Excel-отчёт не скачан")).toBeVisible();
        expect(screen.getByText("Не удалось выполнить действие. Попробуйте ещё раз")).toBeVisible();
        expect(screen.queryByText(/backend export detail/)).not.toBeInTheDocument();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:payrollExport]", failure);
        const firstParameters = vi.mocked(salaryService.downloadReportTable).mock.calls[0][0];

        await user.dblClick(screen.getByRole("button", {name: "Повторить"}));

        expect(salaryService.downloadReportTable).toHaveBeenCalledTimes(2);
        expect(vi.mocked(salaryService.downloadReportTable).mock.calls[1][0]).toBe(firstParameters);
        expect(screen.queryByRole("button", {name: "Повторить"})).not.toBeInTheDocument();
        expect(screen.getByRole("button", {name: "Excel-отчёт формируется"})).toBeDisabled();

        resolveRetry(blob);

        expect(await screen.findByText("Excel-отчёт скачан")).toBeVisible();
        expect(downloadFile).toHaveBeenCalledOnce();
        expect(downloadFile).toHaveBeenCalledWith(blob, "salary-report.xlsx");
    });

    it("dismisses persistent export loading when global session expiry takes over", async () => {
        const user = userEvent.setup();
        let rejectDownload!: (error: unknown) => void;
        vi.mocked(salaryService.downloadReportTable).mockReturnValue(new Promise((_, reject) => {
            rejectDownload = reject;
        }));
        renderPage();
        const download = await screen.findByRole("button", {name: "Скачать Excel"});

        await user.click(download);
        expect(await screen.findByRole("status")).toHaveTextContent("Excel-отчёт формируется");

        rejectDownload(new ApplicationError("sessionExpired", new Error("refresh failed"), 401));

        await waitFor(() => expect(screen.queryByText("Excel-отчёт формируется")).not.toBeInTheDocument());
        expect(screen.queryByText("Excel-отчёт не скачан")).not.toBeInTheDocument();
        expect(screen.queryByRole("button", {name: "Повторить"})).not.toBeInTheDocument();
        expect(download).toBeEnabled();
    });
});
