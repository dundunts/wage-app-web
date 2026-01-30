// app/api/external/employee/get/[id]/route.ts
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch";

interface Params {
    id: string;
}

export async function GET(
    _: Request,
    { params }: { params: Promise<Params> }
) {
    const { id } = await params;

    const res = await backendFetch(`/api/v1/employee/get/${id}`);
    return NextResponse.json(await res.json(), { status: res.status });
}
