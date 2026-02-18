import {NextResponse} from "next/server";
import {getAuthSession} from "@/sample/auth/auth";

export async function GET() {
    const session = await getAuthSession();

    console.log("Calling public API", session)

    const response = await fetch("http://localhost:8085/test/public");

    const data = await response.text();
    return NextResponse.json(data);
}
