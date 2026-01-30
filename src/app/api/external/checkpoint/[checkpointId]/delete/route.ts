// app/api/checkpoint/[checkpointId]/delete/route.ts
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch";

interface Params {
    checkpointId: string;
}

export async function DELETE(
    _: Request,
    { params }: { params: Promise<Params> }
) {
    const { checkpointId } = await params;

    const response = await backendFetch(
        `/api/v1/checkpoint/${checkpointId}/delete`,
        {
            method: "DELETE",
        }
    );

    return new NextResponse(null, {
        status: response.status,
    });
}
