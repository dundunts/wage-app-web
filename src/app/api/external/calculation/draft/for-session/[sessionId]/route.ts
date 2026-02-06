// app/api/calculation/draft/for-session/[sessionId]/route.ts
import { NextResponse } from "next/server";
import {backendFetch} from "@/lib/api/backendFetch.axios";

interface Params {
    sessionId: string;
}

export async function GET(
    _: Request,
    { params }: { params: Promise<Params> }
) {
    const { sessionId } = await params;

    const response = await backendFetch(
        `/api/v1/calculation/draft/for-session/${sessionId}`
    );

    return NextResponse.json(await response.data, {
        status: response.status,
    });
}
