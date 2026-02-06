import {NextResponse} from "next/server";
import {getAuthSession} from "@/auth/auth";
import {Company, UserCompaniesResponse} from "@/types/company.types";
import {backendFetch} from "@/lib/api/backendFetch.axios";

export async function GET() {
    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 5000); // 5 сек

    try {
        console.log("Server start loading companies")
        // const response = await backendFetch("/api/v1/company/get/for-user");

        const session = await getAuthSession();

        console.log(`Server session:`, session)

        if (!session?.accessToken) {
            throw new Error("Unauthorized");
        }

        console.log(`Access token: ${session.accessToken}`)

        const BACKEND_URL = process.env.BACKEND_URL ?? "http://92.255.107.65:8085";

        console.log("Start calling API")

        // const response = await fetch(
        //     `${BACKEND_URL}/api/v1/company/get/for-user`,
        //     {
        //         headers: {
        //             Authorization: `Bearer ${session.accessToken}`,
        //         },
        //     }
        // );

        const response = await backendFetch<UserCompaniesResponse>('/api/v1/company/get/for-user')

        console.log("End calling API")

        if (response.status != 200) {
            const text = response.data;
            console.error("Backend error:", text);
            throw new Error(`Backend error: ${response.status}`);
        }

        console.log(`Response as text: ${response.data}`)

        const data: UserCompaniesResponse = response.data;
        console.log(`Server: data fetched. ${data}`)

        return NextResponse.json(data.companies);
    } catch (e: unknown) {
        const errorMessage = e instanceof Error
            ? e.message
            : 'An unknown error occurred';

        console.log(`Error: ${errorMessage}`)

        return NextResponse.json(
            {error: errorMessage},
            {status: 401}
        );
    } finally {
        clearTimeout(timeoutId);
    }
}
