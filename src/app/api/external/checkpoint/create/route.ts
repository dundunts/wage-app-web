// app/api/checkpoint/create/route.ts
import { NextResponse } from "next/server";
import { backendFetch } from "@/sample/lib/api/backendFetch.axios";
import {CreateRegularCheckpointPayload} from "@/types/checkpoint.types";

export async function POST(request: Request) {
    const payload: CreateRegularCheckpointPayload = await request.json();

    const response = await backendFetch(
        "/api/v1/checkpoint/create",
        {
            method: "POST",
            data: payload
        }
    );

    return NextResponse.json(await response.data, {
        status: response.status,
    });
}
