// app/api/external/employee/create/route.ts
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch";

export async function POST(req: Request) {
    const body = await req.json();

    const res = await backendFetch(`/api/v1/employee/create`, {
        method: "POST",
        body: JSON.stringify(body),
    });

    return NextResponse.json(await res.json(), { status: res.status });
}
