import axios from "axios";

export type ApplicationErrorCategory =
    | "invalidRequest"
    | "sessionExpired"
    | "insufficientAccess"
    | "notFound"
    | "conflict"
    | "serverFailure"
    | "connectivity"
    | "unknown";

export interface ApiProblem {
    type?: string;
    title?: string;
    status?: number;
    detail?: string;
    instance?: string;
    [key: string]: unknown;
}

export function isApiProblem(value: unknown): value is ApiProblem {
    if (typeof value !== "object" || value === null || Array.isArray(value)) {
        return false;
    }

    const candidate = value as Record<string, unknown>;
    const knownValues = [candidate.type, candidate.title, candidate.detail, candidate.instance];
    const hasKnownProperty = candidate.status !== undefined || knownValues.some((item) => item !== undefined);

    return hasKnownProperty
        && (candidate.status === undefined || typeof candidate.status === "number")
        && knownValues.every((item) => item === undefined || typeof item === "string");
}

export class ApplicationError extends Error {
    readonly name = "ApplicationError";

    constructor(
        readonly category: ApplicationErrorCategory,
        readonly original: unknown,
        readonly httpStatus?: number,
        readonly problem?: ApiProblem,
    ) {
        super("The action could not be completed");
    }
}

function categoryForStatus(status: number): ApplicationErrorCategory {
    switch (status) {
        case 400:
            return "invalidRequest";
        case 401:
            return "sessionExpired";
        case 403:
            return "insufficientAccess";
        case 404:
            return "notFound";
        case 409:
            return "conflict";
        default:
            return status >= 500 && status <= 599 ? "serverFailure" : "unknown";
    }
}

export function normalizeApiError(error: unknown): ApplicationError {
    if (error instanceof ApplicationError) {
        return error;
    }

    if (!axios.isAxiosError(error)) {
        return new ApplicationError("unknown", error);
    }

    const status = error.response?.status;
    if (status === undefined) {
        return new ApplicationError("connectivity", error);
    }

    const problem = isApiProblem(error.response?.data) ? error.response.data : undefined;
    return new ApplicationError(categoryForStatus(status), error, status, problem);
}

export function normalizeSessionExpiredError(refreshError: unknown): ApplicationError {
    const normalized = normalizeApiError(refreshError);
    return new ApplicationError("sessionExpired", normalized.original, 401);
}
