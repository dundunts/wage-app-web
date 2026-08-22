import {AxiosError, AxiosHeaders} from "axios";
import {describe, expect, it} from "vitest";
import {
    ApplicationError,
    normalizeApiError,
    normalizeSessionExpiredError,
} from "@/feedback/api-error";

function axiosError(status?: number, data?: unknown, code?: string) {
    return new AxiosError(
        "backend detail must stay private",
        code,
        undefined,
        undefined,
        status === undefined
            ? undefined
            : {
                status,
                statusText: "Backend status text",
                headers: {},
                config: {headers: new AxiosHeaders()},
                data,
            },
    );
}

describe("normalizeApiError", () => {
    it.each([
        [400, "invalidRequest"],
        [401, "sessionExpired"],
        [403, "insufficientAccess"],
        [404, "notFound"],
        [409, "conflict"],
        [500, "serverFailure"],
        [503, "serverFailure"],
    ] as const)("normalizes HTTP %s as %s", (status, category) => {
        const original = axiosError(status, {
            type: "about:blank",
            title: "A backend title",
            status,
            detail: "An unsafe backend detail with 5c62ab70-8526-4ee9-a4ec-c66d1fd8915f",
        });

        const normalized = normalizeApiError(original);

        expect(normalized).toBeInstanceOf(ApplicationError);
        expect(normalized).toMatchObject({category, httpStatus: status, original});
        expect(normalized.problem).toMatchObject({status});
        expect(normalized.message).not.toContain("unsafe backend detail");
    });

    it.each([
        [axiosError(undefined, undefined, "ECONNABORTED"), "timeout"],
        [axiosError(), "request without a response"],
    ])("normalizes connectivity failures for %s", (original) => {
        expect(normalizeApiError(original)).toMatchObject({
            category: "connectivity",
            original,
        });
    });

    it("ignores a malformed ProblemDetail", () => {
        const original = axiosError(409, {status: "409", detail: ["private"]});

        expect(normalizeApiError(original)).toMatchObject({
            category: "conflict",
            httpStatus: 409,
            original,
            problem: undefined,
        });
    });

    it.each([
        {label: "non-Axios Error", original: new Error("plain failure")},
        {label: "non-Error rejection", original: "rejected string"},
        {label: "unclassified HTTP status", original: axiosError(418)},
    ])("uses the safe unknown category for $label", ({original}) => {
        expect(normalizeApiError(original)).toMatchObject({
            category: "unknown",
            original,
        });
    });

    it("does not wrap an already normalized error again", () => {
        const original = new Error("original");
        const normalized = new ApplicationError("unknown", original);

        expect(normalizeApiError(normalized)).toBe(normalized);
    });

    it("keeps the session-expired category when token refresh fails differently", () => {
        const refreshFailure = axiosError(503, {detail: "private refresh failure"});

        expect(normalizeSessionExpiredError(refreshFailure)).toMatchObject({
            category: "sessionExpired",
            httpStatus: 401,
            original: refreshFailure,
        });
    });
});
