import {Suspense} from "react";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import ResultDetailsPage from "@/app/(main)/results/[id]/page";
import {Provider} from "@/components/ui/provider";
import {toaster} from "@/feedback/toast-store";
import {companyService} from "@/service/company/company.service";
import {shiftResultService} from "@/service/results/shiftResult.service";
import {CalculationSource} from "@/types/shiftResult.types";

const navigation = vi.hoisted(() => ({push: vi.fn()}));

vi.mock("next/navigation", () => ({
    useRouter: () => navigation,
}));

vi.mock("@/service/company/company.service", () => ({
    companyService: {getForUser: vi.fn()},
}));

vi.mock("@/service/results/shiftResult.service", () => ({
    shiftResultService: {
        getDetailed: vi.fn(),
        delete: vi.fn(),
    },
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

function renderPage() {
    const params = Promise.resolve({id: "result-1"}) as Promise<{id: string}> & {
        status: "fulfilled";
        value: {id: string};
    };
    params.status = "fulfilled";
    params.value = {id: "result-1"};

    render(
        <Provider defaultTheme="light">
            <Suspense fallback={<div>Загрузка теста</div>}>
                <ResultDetailsPage params={params} />
            </Suspense>
        </Provider>,
    );
}

async function openDeleteDialog(user: ReturnType<typeof userEvent.setup>) {
    renderPage();
    const trigger = await screen.findByRole("button", {name: "Удалить"});
    await user.click(trigger);
    return trigger;
}

describe("Shift Result detail deletion", () => {
    beforeEach(() => {
        toaster.remove();
        navigation.push.mockReset();
        vi.mocked(companyService.getForUser).mockReset();
        vi.mocked(companyService.getForUser).mockResolvedValue([company]);
        vi.mocked(shiftResultService.getDetailed).mockReset();
        vi.mocked(shiftResultService.getDetailed).mockResolvedValue({
            shiftResult: result,
            session: null,
        });
        vi.mocked(shiftResultService.delete).mockReset();
    });

    afterEach(() => vi.restoreAllMocks());

    it("uses the shared alert dialog and cancels without deleting", async () => {
        const user = userEvent.setup();
        const nativeConfirm = vi.spyOn(window, "confirm");
        const trigger = await openDeleteDialog(user);

        expect(screen.getByRole("alertdialog", {
            name: "Удалить результат смены?",
        })).toBeVisible();
        expect(nativeConfirm).not.toHaveBeenCalled();

        await user.click(screen.getByRole("button", {name: "Отмена"}));

        expect(shiftResultService.delete).not.toHaveBeenCalled();
        expect(navigation.push).not.toHaveBeenCalled();
        await waitFor(() => expect(trigger).toHaveFocus());
    });

    it("prevents repeated deletion while pending and navigates exactly once after success", async () => {
        const user = userEvent.setup();
        let resolveDelete!: () => void;
        vi.mocked(shiftResultService.delete).mockReturnValue(new Promise((resolve) => {
            resolveDelete = resolve;
        }));
        await openDeleteDialog(user);

        await user.click(within(screen.getByRole("alertdialog")).getByRole("button", {
            name: "Удалить",
        }));

        const pending = screen.getByRole("button", {name: "Результат смены удаляется"});
        expect(pending).toBeDisabled();
        await user.click(pending);
        expect(shiftResultService.delete).toHaveBeenCalledOnce();
        expect(shiftResultService.delete).toHaveBeenCalledWith("result-1");
        expect(navigation.push).not.toHaveBeenCalled();

        resolveDelete();

        expect(await screen.findByText("Результат смены удалён")).toBeVisible();
        await waitFor(() => expect(navigation.push).toHaveBeenCalledOnce());
        expect(navigation.push).toHaveBeenCalledWith("/results");
    });

    it("shows safe feedback after failure without navigating and remains recoverable", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend delete detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(shiftResultService.delete).mockRejectedValue(failure);
        await openDeleteDialog(user);

        await user.click(within(screen.getByRole("alertdialog")).getByRole("button", {
            name: "Удалить",
        }));

        expect(await screen.findByText("Результат смены не удалён")).toBeVisible();
        expect(screen.getByText("Не удалось выполнить действие. Попробуйте ещё раз")).toBeVisible();
        expect(screen.queryByText(/backend delete detail/)).not.toBeInTheDocument();
        expect(navigation.push).not.toHaveBeenCalled();
        expect(screen.getByRole("alertdialog")).toBeVisible();
        const dialog = screen.getByRole("alertdialog");
        expect(within(dialog).getByRole("button", {name: "Удалить"})).toBeEnabled();
        expect(within(dialog).getByRole("button", {name: "Отмена"})).toBeEnabled();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:shiftResultDelete]", failure);
    });
});
