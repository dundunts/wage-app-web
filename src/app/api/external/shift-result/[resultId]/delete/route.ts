import { backendFetch } from "@/lib/api/backendFetch";
import { NextResponse } from "next/server";

interface Params {
    resultId: string;
}

export async function DELETE(
    _: Request,
    { params }: { params: Promise<Params> }
) {
    const { resultId } = await params;

    const response = await backendFetch(
        `/api/v1/shift-result/${resultId}/delete`,
        { method: "DELETE" }
    );

    return new NextResponse(null, {
        status: response.status,
    });
}
