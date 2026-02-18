import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/sample/lib/api/backendFetch.axios";
import { CreateRecalculatingShiftSessionPayload } from "@/types/session.types";

export async function POST(request: NextRequest) {
    const payload: CreateRecalculatingShiftSessionPayload =
        await request.json();

    const response = await backendFetch(
        "/api/v1/session/recalculating",
        {
            method: "POST",
            data: JSON.stringify(payload),
        }
    );

    return NextResponse.json(await response.data, { status: 201 });
}
