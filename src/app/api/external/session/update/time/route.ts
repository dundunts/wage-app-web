// @/app/api/external/session/update/time/route.ts
import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/sample/lib/api/backendFetch.axios";
import {UpdateShiftSessionStartWorkTimePayload} from "@/types/session.types";
import {revalidatePath} from "next/cache";

export async function PUT(request: NextRequest) {
    const payload: UpdateShiftSessionStartWorkTimePayload =
        await request.json();

    console.log("Start updating session time with payload", payload)

    const response = await backendFetch<void>(
        "/api/v1/session/update/time",
        {
            method: "PUT",
            data: payload,
        }
    );

    revalidatePath("/calculator/checkpoints");

    console.log(response)

    return new NextResponse(null, { status: 204 });
}
