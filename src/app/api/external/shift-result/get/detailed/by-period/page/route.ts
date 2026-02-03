import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);

    const response = await backendFetch(
        `/api/v1/shift-result/get/detailed/by-period/page?${searchParams.toString()}`
    );

    return NextResponse.json(await response.json(), {
        status: response.status,
    });
}
