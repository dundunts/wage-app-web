import {NextResponse} from "next/server";
import {getAuthSession} from "@/sample/auth/auth";

export async function GET() {
    console.log("Calling public API")
    const session = await getAuthSession();
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
