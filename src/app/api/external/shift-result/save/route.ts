import { NextResponse } from "next/server";
import { backendFetch } from "@/sample/lib/api/backendFetch.axios";

export async function POST(request: Request) {
    const payload = await request.json();

    const response = await backendFetch(
        `/api/v1/shift-result/save`,
        {
            method: "POST",
            data: JSON.stringify(payload),
        }
    );

    return NextResponse.json(await response.data, {
        status: response.status,
    });
}
