import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";
import SessionPage from "@/app/(main)/calculator/session/page";
import {Provider} from "@/components/ui/provider";
import {companyService} from "@/service/company/company.service";
import {sessionService} from "@/service/session/session.service";
import type {Session} from "@/types/session.types";

const navigation = vi.hoisted(() => ({push: vi.fn()}));

vi.mock("next/navigation", () => ({
    useRouter: () => navigation,
    useSearchParams: () => ({
        get: (name: string) => name === "companyId" ? "company-1" : null,
    }),
}));

vi.mock("@/service/company/company.service", () => ({
    companyService: {getById: vi.fn()},
}));

vi.mock("@/service/session/session.service", () => ({
    sessionService: {
        getAllAvailableByCompany: vi.fn(),
        open: vi.fn(),
    },
}));

const company = {
    id: "company-1",
    title: "Kruzhka Kolp",
    employeeWageCoefficientFromRevenue: 0.4,
    defaultShiftStartTime: "09:00",
};

const sessions: Session[] = [
    {
        id: "session-1",
        companyId: company.id,
        startWorkTime: "09:00",
        date: new Date("2026-08-21T09:00:00"),
        status: "OPENED",
        checkpoints: [],
    },
    {
        id: "session-2",
        companyId: company.id,
        startWorkTime: "10:00",
        date: new Date("2026-08-20T10:00:00"),
        status: "OPENED_DRAFT",
        checkpoints: [],
    },
];

function renderPage() {
    return render(
        <Provider defaultTheme="dark">
            <SessionPage />
        </Provider>,
    );
}

beforeEach(() => {
    navigation.push.mockReset();
    vi.mocked(companyService.getById).mockReset();
    vi.mocked(sessionService.getAllAvailableByCompany).mockReset();
});

describe("SessionPage", () => {
    it("shows loading and then the padded empty state with its action", async () => {
        vi.mocked(companyService.getById).mockResolvedValue(company);
        vi.mocked(sessionService.getAllAvailableByCompany).mockResolvedValue([]);

        renderPage();

        expect(screen.getByRole("status", {name: "Shift Session загружаются"})).toBeVisible();
        expect(await screen.findByRole("heading", {name: "Shift Session"})).toBeVisible();
        expect(screen.getByRole("listitem", {name: "1. Сессия: текущий"})).toHaveAttribute(
            "aria-current",
            "step",
        );
        expect(screen.getByRole("heading", {name: "Начните новую смену"})).toBeVisible();
        expect(screen.getByLabelText("Рабочая точка: Kruzhka Kolp")).toBeVisible();
        expect(screen.getByRole("button", {name: "Открыть сессию"})).toBeVisible();
    });

    it("shows the load error without leaking the thrown message", async () => {
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(companyService.getById).mockRejectedValue(new Error("private backend detail"));

        renderPage();

        expect(await screen.findByRole("alert")).toHaveTextContent("Error while loading data");
        expect(screen.queryByText("private backend detail")).not.toBeInTheDocument();
        expect(consoleError).toHaveBeenCalledOnce();
        consoleError.mockRestore();
    });

    it("renders multiple open sessions and keeps their navigation behavior", async () => {
        const user = userEvent.setup();
        vi.mocked(companyService.getById).mockResolvedValue(company);
        vi.mocked(sessionService.getAllAvailableByCompany).mockResolvedValue(sessions);

        renderPage();

        const openedSession = await screen.findByText("Статус: Открыта");
        expect(screen.getByText("Статус: Черновик расчёта")).toBeVisible();
        await user.click(openedSession.closest("button")!);

        expect(navigation.push).toHaveBeenCalledWith(
            "/calculator/checkpoints?sessionId=session-1",
        );
    });

    it("keeps the automatic redirect when exactly one session is open", async () => {
        vi.mocked(companyService.getById).mockResolvedValue(company);
        vi.mocked(sessionService.getAllAvailableByCompany).mockResolvedValue([sessions[0]]);

        renderPage();

        await waitFor(() => expect(navigation.push).toHaveBeenCalledWith(
            "/calculator/checkpoints?sessionId=session-1",
        ));
    });
});
