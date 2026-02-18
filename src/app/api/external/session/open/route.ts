import { NextResponse } from "next/server";
import { backendFetch } from "@/sample/lib/api/backendFetch.axios";

export async function POST(req: Request) {
    const body = await req.json();

    try {
        const response = await backendFetch("/api/v1/session/open", {
            method: "POST",
            data: JSON.stringify(body),
        });

        return NextResponse.json(response.data, { status: 201 });
    } catch (e: unknown) {
        const errorMessage = e instanceof Error
            ? e.message
            : 'An unknown error occurred';

        return NextResponse.json(
            { error: errorMessage },
            { status: 401 }
        );
    }
}
