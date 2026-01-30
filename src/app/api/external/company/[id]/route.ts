import {NextRequest, NextResponse} from "next/server";
import {backendFetch} from "@/lib/api/backendFetch";
import {CompanyPayload} from "@/types/company.types";

interface Params {
    params: { id: string };
}

export async function GET(
    _: Request,
    { params }: { params: Promise<{id: string}> }
) {
    try {
        const id = (await params).id

        const response = await backendFetch(
            `/api/v1/company/get/${id}`
        );

        const company = await response.json();
        return NextResponse.json(company);
    } catch (e) {
        return NextResponse.json(
            { error: (e as Error).message },
            { status: 404 }
        );
    }
}

export async function PUT(
    request: NextRequest,
    { params }: Params
) {
    try {
        const payload: CompanyPayload = await request.json();

        await backendFetch(
            `/api/v1/company/update/${params.id}`,
            {
                method: "PUT",
                body: JSON.stringify(payload),
            }
        );

        return NextResponse.json(null, { status: 204 });
    } catch (e) {
        return NextResponse.json(
            { error: (e as Error).message },
            { status: 400 }
        );
    }
}

export async function DELETE(
    _: Request,
    { params }: Params
) {
    try {
        await backendFetch(
            `/api/v1/company/delete/${params.id}`,
            { method: "DELETE" }
        );

        return NextResponse.json(null, { status: 204 });
    } catch (e) {
        return NextResponse.json(
            { error: (e as Error).message },
            { status: 400 }
        );
    }
}