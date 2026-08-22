import {Suspense} from "react";
import {render, screen, waitFor, within} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import ResultDetailsPage from "@/app/(main)/results/[id]/page";
import {Provider} from "@/components/ui/provider";
import {toaster} from "@/feedback/toast-store";
import {shiftResultService} from "@/service/results/shiftResult.service";
import {CalculationSource} from "@/types/shiftResult.types";

const navigation = vi.hoisted(() => ({push: vi.fn()}));

vi.mock("next/navigation", () => ({
    useRouter: () => navigation,
}));

vi.mock("@/service/results/shiftResult.service", () => ({
    shiftResultService: {
        getDetailed: vi.fn(),
        delete: vi.fn(),
    },
}));

const result = {
    id: "result-1",
    date: new Date("2026-08-21"),
    sessionId: null,
    calculationSource: CalculationSource.MANUAL_OVERRIDE,
    payments: [],
};

const resultWithPayment = {
    ...result,
    payments: [{
        id: "payment-1",
        employee: {
            id: "employee-1",
            firstName: "Иван",
            lastName: "Иванов",
            patronymic: "Иванович",
            simpleName: null,
        },
        percentFromRevenue: 1234.5,
        tips: 300.25,
        workSeconds: 30600,
    }],
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

describe("Shift Result and Payment presentation", () => {
    it("exposes a labelled Payment with comparable money, hours, and calculation source", async () => {
        vi.mocked(shiftResultService.getDetailed).mockResolvedValue({
            shiftResult: resultWithPayment,
            session: null,
        });
        renderPage();

        expect(await screen.findByText("Ручной расчёт")).toBeVisible();
        const payment = screen.getByRole("article", {name: "Выплата: Иванов Иван"});
        expect(within(payment).getByLabelText("Требует внимания: ручная корректировка")).toBeVisible();
        expect(within(payment).getByText(/1\s?234,50\s₽/)).toBeVisible();
        expect(within(payment).getByText(/300,25\s₽/)).toBeVisible();
        expect(within(payment).getByText(/1\s?534,75\s₽/)).toBeVisible();
        expect(within(payment).getByText("8,5 ч")).toBeVisible();
    });
});
