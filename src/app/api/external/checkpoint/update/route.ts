// app/api/checkpoint/update/route.ts
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch";
import {UpdateShiftCheckpointPayload} from "@/types/checkpoint.types";

export async function POST(request: Request) {
    const payload: UpdateShiftCheckpointPayload = await request.json();

    const response = await backendFetch(
        "/api/v1/checkpoint/update",
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );

    return NextResponse.json(await response.json(), {
        status: response.status,
    });
}
