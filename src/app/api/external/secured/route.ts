import { NextResponse } from "next/server";
import { getServerSession } from "next-auth";
import { authOptions } from "@/app/api/auth/[...nextauth]/route";

export async function GET() {
    console.log("Calling public API")
    const session = await getServerSession(authOptions);
    console.log(`Session: ${session}`)

    if (!session?.accessToken) {
        return NextResponse.json(
            { error: "Unauthorized" },
            { status: 401 }
        );
    }

    const response = await fetch(
        "http://localhost:8085/test/private",
        {
            headers: {
                Authorization: `Bearer ${session.accessToken}`,
            },
        }
    );

    const data = await response.text();
    return NextResponse.json(data);
}
