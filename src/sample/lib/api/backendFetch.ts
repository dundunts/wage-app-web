// import {getAuthSession} from "@/auth/auth";
//
// const BACKEND_URL = process.env.BACKEND_URL ?? "http://92.255.107.65:8085";
//
// export async function backendFetch(
//     input: string,
//     init: RequestInit = {}
// ) {
//     const session = await getAuthSession();
//
//     if (!session?.accessToken) {
//         throw new Error("Unauthorized");
//     }
//
//     console.log(`Access token: ${session.accessToken}`)
//
//     const response = await fetch(`${BACKEND_URL}${input}`, {
//         ...init,
//         headers: {
//             "Content-Type": "application/json",
//             Authorization: `Bearer ${session.accessToken}`,
//             ...init.headers,
//         },
//         cache: "no-store",
//     });
//
//     if (!response.ok) {
//         const text = await response.text();
//         throw new Error(text || response.statusText);
//     }
//
//     return response;
// }
