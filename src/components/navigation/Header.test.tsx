import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {Header} from "@/components/navigation/Header";
import {Provider} from "@/components/ui/provider";
import {toaster} from "@/feedback/toast-store";
import {ApplicationError} from "@/feedback/api-error";
import {authService} from "@/service/auth.service";
import {deferred} from "@/test/deferred";
import {adminPermissions} from "@/constants/roles";

const navigation = vi.hoisted(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    pathname: "/statistic",
}));

const userState = vi.hoisted(() => ({permissions: [] as string[]}));

vi.mock("next/navigation", () => ({
    useRouter: () => navigation,
    usePathname: () => navigation.pathname,
}));

vi.mock("@/service/auth.service", () => ({
    authService: {
        logout: vi.fn(),
    },
}));

vi.mock("@/store/userStore", () => ({
    default: () => userState,
}));

function renderHeader() {
    render(
        <Provider defaultTheme="light">
            <Header />
        </Provider>,
    );
}

describe("Authentication logout", () => {
    beforeEach(() => {
        toaster.remove();
        navigation.push.mockReset();
        navigation.replace.mockReset();
        vi.mocked(authService.logout).mockReset();
    });

    afterEach(() => vi.restoreAllMocks());

    it("shows a successful outcome and redirects to authentication", async () => {
        const user = userEvent.setup();
        vi.mocked(authService.logout).mockResolvedValue();
        renderHeader();

        await user.click(screen.getByRole("button", {name: "Open menu"}));
        await user.click(await screen.findByRole("button", {name: /Выйти/}));

        expect(await screen.findByText("Вы вышли из системы")).toBeVisible();
        expect(authService.logout).toHaveBeenCalledOnce();
        expect(navigation.replace).toHaveBeenCalledWith("/auth");
    });

    it("reports remote failure while leaving the local logout outcome unambiguous", async () => {
        const user = userEvent.setup();
        const backendError = new Error("remote session 7d29 was not closed");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(authService.logout).mockRejectedValue(
            new ApplicationError("serverFailure", backendError, 503),
        );
        renderHeader();

        await user.click(screen.getByRole("button", {name: "Open menu"}));
        const logout = await screen.findByRole("button", {name: /Выйти/});
        await user.click(logout);

        expect(await screen.findByText("Вы вышли из системы")).toBeVisible();
        expect(screen.getByText(
            "Данные входа удалены на этом устройстве, но завершить сеанс на сервере не удалось",
        )).toBeVisible();
        expect(screen.queryByText(/7d29|remote session/i)).not.toBeInTheDocument();
        expect(authService.logout).toHaveBeenCalledOnce();
        expect(navigation.replace).toHaveBeenCalledWith("/auth");
        expect(logout).toBeEnabled();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:logout]", backendError);
    });

    it("protects a pending logout from repeated submission", async () => {
        const user = userEvent.setup();
        const logoutRequest = deferred<void>();
        vi.mocked(authService.logout).mockReturnValue(logoutRequest.promise);
        renderHeader();

        await user.click(screen.getByRole("button", {name: "Open menu"}));
        const logout = await screen.findByRole("button", {name: /Выйти/});
        await user.click(logout);

        expect(logout).toBeDisabled();
        await user.click(logout);
        expect(authService.logout).toHaveBeenCalledOnce();

        logoutRequest.resolve();
        expect(await screen.findByText("Вы вышли из системы")).toBeVisible();
    });
});

describe("Navigation", () => {
    beforeEach(() => {
        navigation.pathname = "/statistic";
        userState.permissions = [];
    });

    it("exposes the current destination to assistive technology", async () => {
        const user = userEvent.setup();
        renderHeader();
        await user.click(screen.getByRole("button", {name: "Open menu"}));

        expect(await screen.findByRole("button", {name: "Статистика"})).toHaveAttribute(
            "aria-current",
            "page",
        );
    });

    it("keeps an active navigation group distinct from the current destination", async () => {
        const user = userEvent.setup();
        navigation.pathname = "/company/company-1";
        userState.permissions = adminPermissions;
        renderHeader();

        await user.click(screen.getByRole("button", {name: "Open menu"}));
        const admin = await screen.findByRole("button", {name: "Админ. панель"});
        expect(admin).not.toHaveAttribute("aria-current");

        await user.click(admin);
        expect(await screen.findByRole("button", {name: "Предприятия"})).toHaveAttribute(
            "aria-current",
            "page",
        );
    });

    it("dismisses the mobile navigation from its keyboard close action", async () => {
        const user = userEvent.setup();
        renderHeader();

        await user.click(screen.getByRole("button", {name: "Open menu"}));
        expect(await screen.findByRole("dialog", {name: "Навигация"})).toBeVisible();
        const close = screen.getByRole("button", {name: "Close"});
        close.focus();
        await user.keyboard("{Enter}");

        await waitFor(() => {
            expect(screen.queryByRole("dialog", {name: "Навигация"})).not.toBeInTheDocument();
        });
    });
});
