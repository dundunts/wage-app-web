import { NextResponse } from "next/server";
import { backendFetch } from "@/sample/lib/api/backendFetch.axios";

interface Params {
    sessionId: string;
}

export async function GET(
    _: Request,
    { params }: { params: Promise<Params> }
) {
    const sessionId = (await params).sessionId

    const response = await backendFetch(
        `/api/v1/session/get/available/${sessionId}`
    );

    return NextResponse.json(await response.data);
}
