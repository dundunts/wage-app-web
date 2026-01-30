// app/api/calculation/draft/[id]/delete/route.ts
import { backendFetch } from "@/lib/api/backendFetch";
import { NextResponse } from "next/server";

interface Params {
    id: string;
}

export async function DELETE(
    _: Request,
    { params }: { params: Promise<Params> }
) {
    const { id } = await params;

    const response = await backendFetch(
        `/api/v1/calculation/draft/${id}/delete`,
        {
            method: "DELETE",
        }
    );

    return new NextResponse(null, {
        status: response.status,
    });
}
