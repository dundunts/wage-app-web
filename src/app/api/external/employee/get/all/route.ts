// app/api/external/employee/get/all/route.ts
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch";

export async function GET() {
    const res = await backendFetch(`/api/v1/employee/get/all`);
    return NextResponse.json(await res.json(), { status: res.status });
}
