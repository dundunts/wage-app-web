import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch.axios";
import {UpdateShiftSessionStartWorkTimePayload} from "@/types/session.types";

export async function PUT(request: NextRequest) {
    const payload: UpdateShiftSessionStartWorkTimePayload =
        await request.json();

    await backendFetch(
        "/api/v1/session/update/time",
        {
            method: "PUT",
            data: JSON.stringify(payload),
        }
    );

    return NextResponse.json(null, { status: 204 });
}
