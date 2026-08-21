import {render, screen} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {Header} from "@/components/navigation/Header";
import {Provider} from "@/components/ui/provider";
import {toaster} from "@/components/ui/toaster";
import {ApplicationError} from "@/feedback/api-error";
import {authService} from "@/service/auth.service";

const navigation = vi.hoisted(() => ({
    push: vi.fn(),
    replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => navigation,
}));

vi.mock("@/service/auth.service", () => ({
    authService: {
        logout: vi.fn(),
    },
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
});
