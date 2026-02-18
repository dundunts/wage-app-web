// app/api/external/employee/create/route.ts
import { NextResponse } from "next/server";
import { backendFetch } from "@/sample/lib/api/backendFetch.axios";

export async function POST(req: Request) {
    const body = await req.json();

    const res = await backendFetch(`/api/v1/employee/create`, {
        method: "POST",
        data: JSON.stringify(body),
    });

    return NextResponse.json(await res.data, { status: res.status });
}
