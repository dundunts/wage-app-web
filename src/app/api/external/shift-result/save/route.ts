import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch";

export async function POST(request: Request) {
    const payload = await request.json();

    const response = await backendFetch(
        `/api/v1/shift-result/save`,
        {
            method: "POST",
            body: JSON.stringify(payload),
        }
    );

    return NextResponse.json(await response.json(), {
        status: response.status,
    });
}
