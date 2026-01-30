import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch";

export async function GET(request: Request) {
    const { searchParams } = new URL(request.url);
    const companyId = searchParams.get("companyId");

    if (!companyId) {
        return NextResponse.json(
            { error: "companyId is required" },
            { status: 400 }
        );
    }

    const response = await backendFetch(
        `/api/v1/session/get/opened?companyId=${companyId}`
    );

    return NextResponse.json(await response.json());
}
