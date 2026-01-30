// app/api/checkpoint/create/route.ts
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch";
import {CreateRegularCheckpointPayload} from "@/types/checkpoint.types";

export async function POST(request: Request) {
    const payload: CreateRegularCheckpointPayload = await request.json();

    const response = await backendFetch(
        "/api/v1/checkpoint/create",
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );

    return NextResponse.json(await response.json(), {
        status: response.status,
    });
}
