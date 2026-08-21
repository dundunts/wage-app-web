import {render, screen} from "@testing-library/react";
import {AxiosError, type AxiosAdapter} from "axios";
import {afterEach, beforeEach, describe, expect, it, vi} from "vitest";
import {AxiosInterceptor} from "@/api/config/api";
import {SessionExpiryHandler} from "@/auth/session-expiry";
import SessionExpiryBoundary from "@/components/auth/SessionExpiryBoundary";
import {Provider} from "@/components/ui/provider";
import {toaster} from "@/components/ui/toaster";
import {feedback} from "@/feedback/feedback";

const navigation = vi.hoisted(() => ({replace: vi.fn()}));

vi.mock("next/navigation", () => ({
    useRouter: () => navigation,
}));

const unauthorizedAdapter: AxiosAdapter = async (config) => {
    const response = {
        config,
        data: {detail: "Refresh token for subject 25ae is invalid"},
        headers: {},
        status: 401,
        statusText: "Unauthorized",
    };
    throw new AxiosError(
        "Request failed with status code 401",
        "ERR_BAD_REQUEST",
        config,
        undefined,
        response,
    );
};

describe("Expired authentication session", () => {
    beforeEach(() => toaster.remove());
    afterEach(() => vi.restoreAllMocks());

    it("shows one safe notification and redirects concurrent failed refreshes with return location", async () => {
        const refreshFailure = new Error("refresh token 25ae was revoked");
        const consoleError = vi.spyOn(console, "error").mockImplementation(() => {});
        const clearAuthentication = vi.fn();
        const clearTokens = vi.fn();
        const handler = new SessionExpiryHandler({
            clearAuthentication,
            clearTokens,
            getReturnLocation: () => "/results?companyId=company-1#result-7",
        });
        const tokenBoundary = {
            getAccessToken: () => "expired-access-token",
            refresh: vi.fn().mockRejectedValue(refreshFailure),
        };
        const client = new AxiosInterceptor(
            {adapter: unauthorizedAdapter},
            tokenBoundary,
            handler,
        ).axiosInstance;
        render(
            <Provider defaultTheme="light">
                <SessionExpiryBoundary handler={handler}/>
                <div>Protected page</div>
            </Provider>,
        );

        const outcomes = await Promise.allSettled([
            client.get("/first-protected-resource"),
            client.get("/second-protected-resource"),
        ]);
        const firstFailure = outcomes[0] as PromiseRejectedResult;
        feedback.beginAction("shiftResultSave").error(firstFailure.reason);
        toaster.create({title: "Legacy protected request failed", type: "error"});

        expect(outcomes).toHaveLength(2);
        expect(outcomes.every((outcome) => outcome.status === "rejected")).toBe(true);
        expect(await screen.findByText("Сессия завершена")).toBeVisible();
        expect(screen.getAllByText("Сессия завершена")).toHaveLength(1);
        expect(screen.getByText("Сессия истекла. Войдите снова")).toBeVisible();
        expect(screen.queryByText(/25ae|revoked|Refresh token/i)).not.toBeInTheDocument();
        expect(screen.queryByText("Legacy protected request failed")).not.toBeInTheDocument();
        expect(clearTokens).toHaveBeenCalledOnce();
        expect(clearAuthentication).toHaveBeenCalledOnce();
        expect(navigation.replace).toHaveBeenCalledOnce();
        expect(navigation.replace).toHaveBeenCalledWith(
            "/auth?redirectUrl=%2Fresults%3FcompanyId%3Dcompany-1%23result-7",
        );
        expect(consoleError.mock.calls).toEqual([
            ["[feedback:sessionExpired]", refreshFailure],
        ]);
    });
});
