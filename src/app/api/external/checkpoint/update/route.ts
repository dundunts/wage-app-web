// app/api/checkpoint/update/route.ts
import { NextResponse } from "next/server";
import { backendFetch } from "@/sample/lib/api/backendFetch.axios";
import {UpdateShiftCheckpointPayload} from "@/types/checkpoint.types";

export async function POST(request: Request) {
    const payload: UpdateShiftCheckpointPayload = await request.json();

    const response = await backendFetch(
        "/api/v1/checkpoint/update",
        {
            method: "POST",
            data: payload,
        }
    );

    return NextResponse.json(await response.data, {
        status: response.status,
    });
}
