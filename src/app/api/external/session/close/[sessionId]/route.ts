// @/app/api/external/session/close/[sessionId]/route.ts
import { NextResponse } from "next/server";
import { backendFetch } from "@/sample/lib/api/backendFetch.axios";

interface Params {
    params: Promise<{ sessionId: string }>;
}

export async function PUT(_: Request, { params }: Params ) {
    const sessionId = (await params).sessionId

    console.log("Close session. Session id: ", sessionId)

    await backendFetch(
        `/api/v1/session/${sessionId}/close`,
        { method: "PUT" }
    );

    return new NextResponse(null, { status: 204 });
}
