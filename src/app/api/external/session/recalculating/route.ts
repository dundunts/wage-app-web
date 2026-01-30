import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch";
import { CreateRecalculatingShiftSessionPayload } from "@/types/session.types";

export async function POST(request: NextRequest) {
    const payload: CreateRecalculatingShiftSessionPayload =
        await request.json();

    const response = await backendFetch(
        "/api/v1/session/recalculating",
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );

    return NextResponse.json(await response.json(), { status: 201 });
}
