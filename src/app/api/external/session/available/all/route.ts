import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/sample/lib/api/backendFetch.axios";
import {Session} from "next-auth";

export async function GET(req: NextRequest) {
    const companyId = req.nextUrl.searchParams.get("companyId");

    if (!companyId) {
        return NextResponse.json(
            { error: "companyId is required" },
            { status: 400 }
        );
    }

    try {
        const response = await backendFetch(
            `/api/v1/session/get/available/all?companyId=${companyId}`
        );

        return NextResponse.json(response.data);
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
