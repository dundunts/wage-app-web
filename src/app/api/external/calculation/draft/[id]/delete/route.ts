// app/api/calculation/draft/[id]/delete/route.ts
import { NextResponse } from "next/server";
import {backendFetch} from "@/lib/api/backendFetch.axios";

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
