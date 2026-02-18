// app/api/external/employee/get/all/route.ts
import { NextResponse } from "next/server";
import { backendFetch } from "@/sample/lib/api/backendFetch.axios";

export async function GET() {
    const res = await backendFetch(`/api/v1/employee/get/all`);
    return NextResponse.json(await res.data, { status: res.status });
}
