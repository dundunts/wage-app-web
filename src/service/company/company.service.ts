import {Company} from "@/types/company.types";

export async function getCompany(companyId: string): Promise<Company> {
    const res = await fetch(
        `/api/external/company/${companyId}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Failed to load company");
    }

    return res.json();
}