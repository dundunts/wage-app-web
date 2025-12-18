import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    const session = await getServerSession(authOptions);

    console.log("Calling public API", session)

    const response = await fetch("http://localhost:8085/test/public");

    const data = await response.text();
    return NextResponse.json(data);
}
