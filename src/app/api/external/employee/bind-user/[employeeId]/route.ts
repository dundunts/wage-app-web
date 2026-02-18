// app/api/external/employee/bind-user/[employeeId]/route.ts
import { backendFetch } from "@/sample/lib/api/backendFetch.axios";
import { NextResponse } from "next/server";

interface Params {
    employeeId: string;
}

export async function PUT(
    req: Request,
    { params }: { params: Promise<Params> }
) {
    const { employeeId } = await params;
    const { searchParams } = new URL(req.url);
    const userId = searchParams.get("userId");

    const res = await backendFetch(
        `/api/v1/employee/bind-user/${employeeId}?userId=${userId}`,
        { method: "PUT" }
    );

    return new NextResponse(null, { status: res.status });
}
