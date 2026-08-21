import {toaster} from "@/feedback/toast-store";
import {normalizeApiError} from "@/feedback/api-error";
import {
    actionErrorDescriptions,
    applicationErrorDescriptions,
    type FeedbackActionKey,
    feedbackMessages,
} from "@/feedback/messages";

type FeedbackTone = "success" | "error" | "warning" | "information" | "loading";
type FinalFeedbackTone = Exclude<FeedbackTone, "loading">;

const durations: Record<FinalFeedbackTone, number> = {
    success: 4_000,
    information: 5_000,
    warning: 8_000,
    error: 8_000,
};

let nextActionId = 0;

interface FinalFeedback {
    success(): void;
    error(error: unknown): void;
    warning(): void;
    information(): void;
}

export interface LoadingFeedback extends FinalFeedback {
    dismiss(): void;
}

export interface ActionFeedback extends FinalFeedback {
    loading(): LoadingFeedback;
}

function toastType(tone: FeedbackTone) {
    return tone === "information" ? "info" : tone;
}

function finalToastOptions(action: FeedbackActionKey, tone: FinalFeedbackTone) {
    return {
        title: feedbackMessages[action][tone],
        type: toastType(tone),
        duration: durations[tone],
        closable: tone === "error" || tone === "warning",
    };
}

class FeedbackFacade {
    beginAction(action: FeedbackActionKey): ActionFeedback {
        const actionId = `${action}:${++nextActionId}`;
        const presented = new Set<string>();
        let errorLogged = false;

        const errorDetails = (error: unknown) => {
            const normalized = normalizeApiError(error);
            if (
                normalized.category === "sessionExpired"
                && action !== "login"
                && action !== "logout"
                && action !== "sessionExpired"
            ) {
                return null;
            }
            if (!errorLogged) {
                console.error(`[feedback:${action}]`, normalized.original);
                errorLogged = true;
            }
            const contextualDescriptions = actionErrorDescriptions[action];
            return contextualDescriptions?.[normalized.category]
                ?? contextualDescriptions?.default
                ?? applicationErrorDescriptions[normalized.category];
        };

        const finalFeedback = (
            present: (tone: FinalFeedbackTone, description?: string) => void,
        ): FinalFeedback => ({
            success: () => present("success"),
            error: (error) => {
                const description = errorDetails(error);
                if (description !== null) present("error", description);
            },
            warning: () => present("warning"),
            information: () => present("information"),
        });

        const show = (tone: FinalFeedbackTone, description?: string) => {
            const signature = `${tone}:${description ?? ""}`;
            if (presented.has(signature)) {
                return;
            }
            presented.add(signature);
            toaster.create({
                id: `${actionId}:${presented.size}`,
                ...finalToastOptions(action, tone),
                description,
            });
        };

        return {
            ...finalFeedback(show),
            loading: () => {
                const id = `${actionId}:loading`;
                if (!presented.has("loading:")) {
                    presented.add("loading:");
                    toaster.create({
                        id,
                        title: feedbackMessages[action].loading,
                        type: "loading",
                        duration: Infinity,
                        closable: false,
                    });
                }

                const update = (
                    tone: FinalFeedbackTone,
                    description?: string,
                ) => toaster.update(id, {
                    ...finalToastOptions(action, tone),
                    description,
                });

                return {
                    ...finalFeedback(update),
                    dismiss: () => toaster.dismiss(id),
                };
            },
        };
    }
}

export const feedback = new FeedbackFacade();
