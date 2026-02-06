// app/api/calculation/draft/[id]/confirm/route.ts
import { NextResponse } from "next/server";
import {backendFetch} from "@/lib/api/backendFetch.axios";
import {ShiftResultDraft} from "@/types/draft.types";

interface Params {
    id: string;
}

export async function POST(
    _: Request,
    { params }: { params: Promise<Params> }
) {
    const { id } = await params;

    const response = await backendFetch<ShiftResultDraft>(
        `/api/v1/calculation/draft/${id}/confirm`,
        {
            method: "POST",
        }
    );

    return NextResponse.json(response.data, {
        status: response.status,
    });
}
