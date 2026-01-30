import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch";

export async function POST(req: Request) {
    const body = await req.json();

    try {
        const response = await backendFetch("/api/v1/session/open", {
            method: "POST",
            body: JSON.stringify(body),
        });

        const data = await response.json();
        return NextResponse.json(data, { status: 201 });
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
