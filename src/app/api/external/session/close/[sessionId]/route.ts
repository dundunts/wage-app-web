import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch";

interface Params {
    params: { sessionId: string };
}

export async function PUT(_: Request, { params }: Params) {
    await backendFetch(
        `/api/v1/session/${params.sessionId}/close`,
        { method: "PUT" }
    );

    return NextResponse.json(null, { status: 204 });
}
