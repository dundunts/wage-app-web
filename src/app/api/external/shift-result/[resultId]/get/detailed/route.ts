import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch.axios";

interface Params {
    resultId: string;
}

export async function GET(
    _: Request,
    { params }: { params: Promise<Params> }
) {
    const { resultId } = await params;

    const response = await backendFetch(
        `/api/v1/shift-result/${resultId}/get/detailed`
    );

    return NextResponse.json(await response.data, {
        status: response.status,
    });
}
