import {AxiosError, AxiosHeaders} from "axios";
import {afterEach, describe, expect, it, vi} from "vitest";
import {ApplicationError} from "@/feedback/api-error";
import {TokensRepository} from "@/data/TokensRepository";
import {AuthService} from "@/service/auth.service";
import type {UserStore} from "@/store/userStore";

function createService() {
    const api = {
        login: vi.fn(),
        logout: vi.fn(),
    };
    const state = {
        clearAuth: vi.fn(),
        setAuth: vi.fn(),
    };
    const service = new AuthService(
        api as never,
        () => state as unknown as UserStore,
    );

    return {api, service, state};
}

describe("AuthService", () => {
    afterEach(() => vi.restoreAllMocks());

    it("normalizes invalid credentials at the authentication API boundary", async () => {
        const {api, service} = createService();
        const config = {headers: new AxiosHeaders()};
        const invalidCredentials = new AxiosError(
            "Request failed with status code 401",
            "ERR_BAD_REQUEST",
            config,
            undefined,
            {
                config,
                data: {detail: "invalid_grant for account 4f7e"},
                headers: {},
                status: 401,
                statusText: "Unauthorized",
            },
        );
        api.login.mockRejectedValue(invalidCredentials);

        await expect(service.login("manager@example.com", "wrong", false)).rejects.toMatchObject({
            category: "sessionExpired",
            original: invalidCredentials,
            httpStatus: 401,
        } satisfies Partial<ApplicationError>);
    });

    it("always clears local authentication when remote logout fails", async () => {
        const remoteFailure = new Error("Keycloak logout failed");
        const {api, service, state} = createService();
        vi.spyOn(TokensRepository, "getRefreshToken").mockReturnValue("refresh-token");
        const clearTokens = vi.spyOn(TokensRepository, "clearTokens").mockImplementation(() => {});
        api.logout.mockRejectedValue(remoteFailure);

        await expect(service.logout()).rejects.toMatchObject({
            category: "unknown",
            original: remoteFailure,
        } satisfies Partial<ApplicationError>);

        expect(api.logout).toHaveBeenCalledWith({refreshToken: "refresh-token"});
        expect(clearTokens).toHaveBeenCalledOnce();
        expect(state.clearAuth).toHaveBeenCalledOnce();
    });
});
