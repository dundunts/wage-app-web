import {ConfirmDraftResponse, ShiftResultDraft} from "@/types/draft.types";

export async function getDraftForSession(
    sessionId: string
): Promise<ShiftResultDraft> {
    const res = await fetch(
        `/api/external/calculation/draft/for-session/${sessionId}`,
        {
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to load calculation draft");
    }

    return res.json();
}

export async function confirmDraft(
    draftId: string
): Promise<ConfirmDraftResponse> {
    const res = await fetch(
        `/api/external/calculation/draft/${draftId}/confirm`,
        {
            method: "POST",
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to confirm draft");
    }

    return res.json();
}

export async function deleteDraft(
    draftId: string
): Promise<void> {
    const res = await fetch(
        `/api/external/calculation/draft/${draftId}/delete`,
        {
            method: "DELETE",
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to delete draft");
    }
}
