// app/api/checkpoint/[checkpointId]/delete/route.ts
import { NextResponse } from "next/server";
import { backendFetch } from "@/sample/lib/api/backendFetch.axios";

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
