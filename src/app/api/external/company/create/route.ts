import { NextRequest, NextResponse } from "next/server";
import { backendFetch } from "@/lib/api/backendFetch";
import { CompanyPayload } from "@/types/company.types";

export async function POST(request: NextRequest) {
    try {
        const payload: CompanyPayload = await request.json();

        const response = await backendFetch(
            "/api/v1/company/create",
            {
                method: "POST",
                body: JSON.stringify(payload),
            }
        );

        const company = await response.json();
        return NextResponse.json(company, { status: 201 });
    } catch (e) {
        return NextResponse.json(
            { error: (e as Error).message },
            { status: 400 }
        );
    }
}
