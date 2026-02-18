// app/api/external/employee/update/[id]/route.ts
import { backendFetch } from "@/sample/lib/api/backendFetch.axios";
import { NextResponse } from "next/server";

interface Params {
    id: string;
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    const { id } = await params;
    const body = await req.json();

    const res = await backendFetch(
        `/api/v1/employee/update/${id}`,
        {
            method: "PUT",
            body: JSON.stringify(body),
        }
    );

    return new NextResponse(null, { status: res.status });
}
