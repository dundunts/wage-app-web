import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import AuthPage from "@/app/auth/page";
import {Provider} from "@/components/ui/provider";
import {toaster} from "@/feedback/toast-store";
import {ApplicationError} from "@/feedback/api-error";
import {authService} from "@/service/auth.service";
import {deferred} from "@/test/deferred";

const navigation = vi.hoisted(() => ({
    push: vi.fn(),
    refresh: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => navigation,
    useSearchParams: () => new URLSearchParams("redirectUrl=%2Fresults%3FcompanyId%3Dcompany-1"),
}));

vi.mock("@/service/auth.service", () => ({
    authService: {
        login: vi.fn(),
    },
}));

function renderPage() {
    render(
        <Provider defaultTheme="light">
            <AuthPage />
        </Provider>,
    );
}

async function submitCredentials(user: ReturnType<typeof userEvent.setup>) {
    await user.type(screen.getByLabelText("Пользователь"), "manager@example.com");
    await user.type(screen.getByLabelText("Пароль"), "wrong-password");
    await user.click(screen.getByRole("button", {name: "Войти"}));
}

describe("Authentication login", () => {
    beforeEach(() => {
        toaster.remove();
        navigation.push.mockReset();
        navigation.refresh.mockReset();
        vi.mocked(authService.login).mockReset();
    });

    afterEach(() => vi.restoreAllMocks());

    it("exposes the authentication screen with a top-level heading", () => {
        renderPage();

        expect(
            screen.getByRole("heading", {name: "Вход в систему", level: 1}),
        ).toBeVisible();
    });

    it("shows safe invalid-credentials feedback without backend detail", async () => {
        const user = userEvent.setup();
        const backendError = new Error("invalid_grant: Account 4f7e is disabled");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        vi.mocked(authService.login).mockRejectedValue(
            new ApplicationError("sessionExpired", backendError, 401),
        );
        renderPage();

        await submitCredentials(user);

        expect(await screen.findByText("Войти не удалось")).toBeVisible();
        expect(screen.getByText("Неверное имя пользователя или пароль")).toBeVisible();
        expect(screen.queryByText(/invalid_grant|4f7e|disabled/i)).not.toBeInTheDocument();
        expect(navigation.push).not.toHaveBeenCalled();
        expect(screen.getByRole("button", {name: "Войти"})).toBeEnabled();
        expect(consoleError).toHaveBeenCalledOnce();
        expect(consoleError).toHaveBeenCalledWith("[feedback:login]", backendError);
    });

    it("shows success and preserves the requested post-login redirect", async () => {
        const user = userEvent.setup();
        vi.mocked(authService.login).mockResolvedValue();
        renderPage();

        await submitCredentials(user);

        expect(await screen.findByText("Вход выполнен")).toBeVisible();
        expect(authService.login).toHaveBeenCalledWith(
            "manager@example.com",
            "wrong-password",
            false,
        );
        expect(navigation.push).toHaveBeenCalledWith("/results?companyId=company-1");
        expect(navigation.refresh).toHaveBeenCalledOnce();
    });

    it("protects a pending login from repeated submission", async () => {
        const user = userEvent.setup();
        const login = deferred<void>();
        vi.mocked(authService.login).mockReturnValue(login.promise);
        renderPage();

        await user.type(screen.getByLabelText("Пользователь"), "manager@example.com");
        await user.type(screen.getByLabelText("Пароль"), "password");
        const submit = screen.getByRole("button", {name: "Войти"});
        await user.click(submit);

        expect(submit).toBeDisabled();
        await user.click(submit);
        expect(authService.login).toHaveBeenCalledOnce();

        login.resolve();
        expect(await screen.findByText("Вход выполнен")).toBeVisible();
    });
});
