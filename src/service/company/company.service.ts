import {Company, CompanyPayload} from "@/types/company.types";
import {Page} from "@/types/common.types";
import {ShiftResultDetailed} from "@/types/shiftResult.types";

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

export async function getUserCompanies(): Promise<Company[]> {
    const res = await fetch(
        "/api/external/company/for-user",
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Не удалось загрузить компании");
    }

    return res.json();
}

interface GetCompanyPageParams {
    page?: number;
    size?: number;
    sort?: string;
}

export async function getCompaniesPage(
    params: GetCompanyPageParams
): Promise<Page<Company>> {
    const searchParams = new URLSearchParams(
        Object.entries(params)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
    );

    const res = await fetch(
        `/api/external/company/get/page?${searchParams}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Failed to load companies");
    }

    return res.json();
}

export async function createCompany(
    payload: CompanyPayload
): Promise<Company> {
    const res = await fetch(
        "/api/external/company/create",
        {
            method: "POST",
            body: JSON.stringify(payload),
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to create company");
    }

    return res.json();
}

export async function updateCompany(
    companyId: string,
    payload: CompanyPayload
): Promise<void> {
    const res = await fetch(
        `/api/external/company/${companyId}`,
        {
            method: "PUT",
            body: JSON.stringify(payload),
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to update company");
    }
}

export async function deleteCompany(
    companyId: string
): Promise<void> {
    const res = await fetch(
        `/api/external/company/${companyId}`,
        {
            method: "DELETE",
            cache: "no-store",
        }
    );

    if (!res.ok) {
        throw new Error("Failed to delete company");
    }
}
