import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch.axios";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const response = await backendFetch(
        `/api/v1/salary/own/get?${searchParams.toString()}`
    );

    return NextResponse.json(await response.data, {
        status: response.status,
    });
}
