// app/api/external/employee/delete/[id]/route.ts
import { backendFetch } from "@/lib/api/backendFetch.axios";
import { NextResponse } from "next/server";

interface Params {
    id: string;
}

export async function DELETE(
    _: Request,
    { params }: { params: Promise<Params> }
) {
    const { id } = await params;

    const res = await backendFetch(
        `/api/v1/employee/delete/${id}`,
        { method: "DELETE" }
    );

    return new NextResponse(null, { status: res.status });
}
