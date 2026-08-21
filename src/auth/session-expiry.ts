import {TokensRepository} from "@/data/TokensRepository";
import {normalizeSessionExpiredError} from "@/feedback/api-error";
import useUserStore from "@/store/userStore";
import type {ApplicationError} from "@/feedback/api-error";
import {
    beginSessionExpiredTransition,
    resetSessionExpiredTransition,
} from "@/feedback/toast-store";

interface SessionExpiryDependencies {
    clearAuthentication(): void;
    clearTokens(): void;
    getReturnLocation(): string;
}

export interface SessionExpiryEvent {
    destination: string;
    error: ApplicationError;
}

function browserReturnLocation() {
    if (typeof window === "undefined") return "/";
    return `${window.location.pathname}${window.location.search}${window.location.hash}`;
}

const browserDependencies: SessionExpiryDependencies = {
    clearAuthentication: () => useUserStore.getState().clearAuth(),
    clearTokens: () => TokensRepository.clearTokens(),
    getReturnLocation: browserReturnLocation,
};

export class SessionExpiryHandler {
    private event: SessionExpiryEvent | null = null;
    private readonly listeners = new Set<() => void>();

    constructor(private readonly dependencies: SessionExpiryDependencies = browserDependencies) {}

    handle(refreshError: unknown) {
        const sessionError = normalizeSessionExpiredError(refreshError);
        if (this.event) return sessionError;

        beginSessionExpiredTransition();
        this.dependencies.clearTokens();
        this.dependencies.clearAuthentication();
        const returnLocation = this.dependencies.getReturnLocation();
        this.event = {
            destination: `/auth?redirectUrl=${encodeURIComponent(returnLocation)}`,
            error: sessionError,
        };
        this.listeners.forEach((listener) => listener());
        return sessionError;
    }

    reset() {
        resetSessionExpiredTransition();
        this.event = null;
        this.listeners.forEach((listener) => listener());
    }

    subscribe = (listener: () => void) => {
        this.listeners.add(listener);
        return () => this.listeners.delete(listener);
    };

    getSnapshot = () => this.event;
}

export const sessionExpiryHandler = new SessionExpiryHandler();
