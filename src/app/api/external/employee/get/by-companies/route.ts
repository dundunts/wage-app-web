// app/api/external/employee/get/by-companies/route.ts
import { NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch.axios";

export async function GET(req: Request) {
    const { searchParams } = new URL(req.url);
    const companyIds = searchParams.getAll("companyIds");

    const query = companyIds.map(id => `companyIds=${id}`).join("&");

    const res = await backendFetch(
        `/api/v1/employee/get/by-companies?${query}`
    );

    return NextResponse.json(await res.data, { status: res.status });
}
