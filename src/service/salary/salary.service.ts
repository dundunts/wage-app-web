import { Payroll, PeriodType } from "@/types/salary.types";

interface GetOwnSalaryParams {
    companyId: string;
    periodType: PeriodType;
    start?: string;
    end?: string;
    now?: string;
}

export async function getOwnSalary(
    params: GetOwnSalaryParams
): Promise<Payroll> {
    const mappedParams = {...params, now: new Date().toISOString().slice(0, 10)}

    const searchParams = new URLSearchParams(
        Object.entries(mappedParams)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
    );

    const res = await fetch(
        `/api/external/salary/own/get?${searchParams.toString()}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Failed to load own salary");
    }

    return res.json();
}

interface GetStaffSalaryParams {
    companyId: string;
    periodType: PeriodType;
    start?: string;
    end?: string;
    now?: string;
}

export async function getStaffSalary(
    params: GetStaffSalaryParams
): Promise<Payroll> {
    const mappedParams = {...params, now: new Date().toISOString().slice(0, 10)}

    const searchParams = new URLSearchParams(
        Object.entries(mappedParams)
            .filter(([, v]) => v !== undefined)
            .map(([k, v]) => [k, String(v)])
    );

    const res = await fetch(
        `/api/external/salary/staff/get?${searchParams.toString()}`,
        { cache: "no-store" }
    );

    if (!res.ok) {
        throw new Error("Failed to load staff salary");
    }

    return res.json();
}
