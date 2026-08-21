import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import DraftPage from "@/app/(main)/calculator/draft/page";
import {Provider} from "@/components/ui/provider";
import {toaster} from "@/components/ui/toaster";
import {calculationService} from "@/service/calculation/calculation.service";

const navigation = vi.hoisted(() => ({
    replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => navigation,
    useSearchParams: () => new URLSearchParams("sessionId=session-1"),
}));

vi.mock("@/service/calculation/calculation.service", () => ({
    calculationService: {
        getDraftForSession: vi.fn(),
        confirmDraft: vi.fn(),
        deleteDraft: vi.fn(),
    },
}));

const draft = {
    id: "draft-1",
    sessionId: "session-1",
    date: "2026-08-21",
    payments: [],
};

function renderPage() {
    render(
        <Provider defaultTheme="light">
            <DraftPage />
        </Provider>,
    );
}

async function openDraft() {
    renderPage();
    return screen.findByRole("button", {name: "Завершить смену"});
}

describe("Shift Result Draft actions", () => {
    beforeEach(() => {
        toaster.remove();
        navigation.replace.mockReset();
        vi.mocked(calculationService.getDraftForSession).mockReset();
        vi.mocked(calculationService.getDraftForSession).mockResolvedValue(structuredClone(draft));
        vi.mocked(calculationService.confirmDraft).mockReset();
        vi.mocked(calculationService.deleteDraft).mockReset();
    });

    afterEach(() => vi.restoreAllMocks());

    it("shows confirmation success and navigates to the created Shift Result", async () => {
        const user = userEvent.setup();
        vi.mocked(calculationService.confirmDraft).mockResolvedValue({resultId: "result-1"});
        const confirm = await openDraft();

        await user.click(confirm);

        expect(await screen.findByText("Результат смены создан")).toBeVisible();
        expect(calculationService.confirmDraft).toHaveBeenCalledOnce();
        expect(calculationService.confirmDraft).toHaveBeenCalledWith("draft-1");
        expect(navigation.replace).toHaveBeenCalledWith("/results/result-1");
    });

    it("shows confirmation failure, stays on the draft, and allows retry", async () => {
        const user = userEvent.setup();
        const failure = new Error("backend detail must stay hidden");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(calculationService.confirmDraft)
            .mockRejectedValueOnce(failure)
            .mockResolvedValueOnce({resultId: "result-1"});
        const confirm = await openDraft();

        await user.click(confirm);

        expect(await screen.findByText("Результат смены не создан")).toBeVisible();
        expect(screen.getByText("Не удалось выполнить действие. Попробуйте ещё раз")).toBeVisible();
        expect(screen.queryByText(/backend detail/)).not.toBeInTheDocument();
        expect(navigation.replace).not.toHaveBeenCalled();
        expect(confirm).toBeEnabled();
        expect(consoleError).toHaveBeenCalledWith("[feedback:shiftResultDraftConfirm]", failure);

        await user.click(confirm);

        expect(await screen.findByText("Результат смены создан")).toBeVisible();
        expect(calculationService.confirmDraft).toHaveBeenCalledTimes(2);
        expect(navigation.replace).toHaveBeenCalledWith("/results/result-1");
    });

    it("shows pending confirmation and sends one request for repeated clicks", async () => {
        const user = userEvent.setup();
        let resolveConfirm!: (value: {resultId: string}) => void;
        vi.mocked(calculationService.confirmDraft).mockReturnValue(new Promise((resolve) => {
            resolveConfirm = resolve;
        }));
        const confirm = await openDraft();

        await user.click(confirm);

        expect(screen.getByRole("button", {name: "Результат смены создаётся"})).toBeDisabled();
        await user.click(screen.getByRole("button", {name: "Результат смены создаётся"}));
        expect(calculationService.confirmDraft).toHaveBeenCalledOnce();

        resolveConfirm({resultId: "result-1"});
        expect(await screen.findByText("Результат смены создан")).toBeVisible();
    });

    it("shows discard success and navigates back to checkpoints", async () => {
        const user = userEvent.setup();
        vi.mocked(calculationService.deleteDraft).mockResolvedValue();
        await openDraft();

        await user.click(screen.getByRole("button", {name: "Назад"}));

        expect(await screen.findByText("Черновик результата смены удалён")).toBeVisible();
        expect(calculationService.deleteDraft).toHaveBeenCalledOnce();
        expect(calculationService.deleteDraft).toHaveBeenCalledWith("draft-1");
        expect(navigation.replace).toHaveBeenCalledWith(
            "/calculator/checkpoints?sessionId=session-1",
        );
    });

    it("shows discard failure, stays on the draft, and allows retry", async () => {
        const user = userEvent.setup();
        const failure = new Error("private deletion failure");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(calculationService.deleteDraft)
            .mockRejectedValueOnce(failure)
            .mockResolvedValueOnce();
        await openDraft();
        const discard = screen.getByRole("button", {name: "Назад"});

        await user.click(discard);

        expect(await screen.findByText("Черновик результата смены не удалён")).toBeVisible();
        expect(screen.getByText("Не удалось выполнить действие. Попробуйте ещё раз")).toBeVisible();
        expect(screen.queryByText(/private deletion failure/)).not.toBeInTheDocument();
        expect(navigation.replace).not.toHaveBeenCalled();
        expect(discard).toBeEnabled();
        expect(consoleError).toHaveBeenCalledWith("[feedback:shiftResultDraftDiscard]", failure);

        await user.click(discard);

        expect(await screen.findByText("Черновик результата смены удалён")).toBeVisible();
        expect(calculationService.deleteDraft).toHaveBeenCalledTimes(2);
        expect(navigation.replace).toHaveBeenCalledWith(
            "/calculator/checkpoints?sessionId=session-1",
        );
    });

    it("shows pending discard and sends one request for repeated clicks", async () => {
        const user = userEvent.setup();
        let resolveDiscard!: () => void;
        vi.mocked(calculationService.deleteDraft).mockReturnValue(new Promise((resolve) => {
            resolveDiscard = resolve;
        }));
        await openDraft();

        await user.click(screen.getByRole("button", {name: "Назад"}));

        const discard = screen.getByRole("button", {
            name: "Черновик результата смены удаляется",
        });
        expect(discard).toBeDisabled();
        await user.click(discard);
        expect(calculationService.deleteDraft).toHaveBeenCalledOnce();

        resolveDiscard();
        expect(await screen.findByText("Черновик результата смены удалён")).toBeVisible();
    });
});
