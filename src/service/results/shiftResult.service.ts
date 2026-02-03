import {
    ShiftResultDetailed,
    ShiftResultExtendedResponse,
    SaveShiftResultPayload,
    SaveShiftResultResponse,
} from "@/types/shiftResult.types";
import {Page} from "@/types/common.types";

export async function getShiftResultDetailed(
    resultId: string
): Promise<ShiftResultExtendedResponse> {
    const res = await fetch(
        `/api/external/shift-result/${resultId}/get/detailed`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Failed to load shift result");
    }

    return res.json();
}

interface GetShiftResultsByPeriodParams {
    companyId: string;
    periodType: string;
    now: string;
    start?: string;
    end?: string;
    page?: number;
    size?: number;
    sort?: string;
}

export async function getShiftResultsByPeriodPage(
    params: GetShiftResultsByPeriodParams
): Promise<Page<ShiftResultDetailed>> {
    const mappedParams = {...params, now: params.now.slice(0, 10)}

    const searchParams = new URLSearchParams(
        Object.entries(mappedParams)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
    );

    const res = await fetch(
        `/api/external/shift-result/get/detailed/by-period/page?${searchParams}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Failed to load shift results");
    }

    return res.json();
}

export async function saveShiftResult(
    payload: SaveShiftResultPayload
): Promise<SaveShiftResultResponse> {
    const res = await fetch(
        `/api/external/shift-result/save`,
        {
            method: "POST",
            body: JSON.stringify(payload),
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to save shift result");
    }

    return res.json();
}

export async function deleteShiftResult(
    resultId: string
): Promise<void> {
    const res = await fetch(
        `/api/external/shift-result/${resultId}/delete`,
        {
            method: "DELETE",
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to delete shift result");
    }
}
