import {
    CompanyEmployeeInfo,
    CompanyEmployeesResponse,
    CreateEmployeePayload,
    Employee,
    EmployeePosition, UpdateEmployeePayload
} from "@/types/employee.types";

export async function getEmployee(id: string): Promise<Employee> {
    const res = await fetch(`/api/external/employee/get/${id}`, {
        cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to load employee");
    return res.json();
}

export async function getAllEmployees(): Promise<Employee[]> {
    const res = await fetch(`/api/external/employee/get/all`, {
        cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to load employees");
    return res.json();
}

export async function getEmployeesByCompanies(
    companyIds: string[]
): Promise<CompanyEmployeesResponse[]> {
    const query = companyIds.map(id => `companyIds=${id}`).join("&");

    const res = await fetch(
        `/api/external/employee/get/by-companies?${query}`,
        { cache: "no-store" }
    );

    if (!res.ok) throw new Error("Failed to load employees");
    return res.json();
}

export async function getCoworkers(): Promise<CompanyEmployeesResponse[]> {
    const res = await fetch(`/api/external/employee/get/coworkers`, {
        cache: "no-store",
    });

    if (!res.ok) throw new Error("Failed to load coworkers");
    return res.json();
}

export async function getCoworkersForCompany(companyId: string): Promise<CompanyEmployeeInfo[]> {
    const coworkersByCompany = await getCoworkers()
    return coworkersByCompany.find(info => info.companyId === companyId)?.data || []
}

export async function getAvailableEmployeesForCompany(companyId: string): Promise<CompanyEmployeeInfo[]> {
    const coworkers = await getCoworkersForCompany(companyId)
    return coworkers.filter(emp => emp.position === EmployeePosition.WAITER_ACTIVE)
}

/**
 * Создать сотрудника
 * POST /api/external/employee/create
 * returns Employee
 */
export async function createEmployee(
    payload: CreateEmployeePayload
): Promise<Employee> {
    const res = await fetch("/api/external/employee/create", {
        method: "POST",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error("Failed to create employee");
    }

    return res.json();
}

/**
 * Обновить сотрудника
 * PUT /api/external/employee/update/:id
 * returns 204 no content
 */
export async function updateEmployee(
    id: string,
    payload: UpdateEmployeePayload
): Promise<void> {
    const res = await fetch(`/api/external/employee/update/${id}`, {
        method: "PUT",
        headers: {
            "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
    });

    if (!res.ok) {
        throw new Error("Failed to update employee");
    }
}

/**
 * Удалить сотрудника
 * DELETE /api/external/employee/delete/:id
 * returns 204 no content
 */
export async function deleteEmployee(id: string): Promise<void> {
    const res = await fetch(`/api/external/employee/delete/${id}`, {
        method: "DELETE",
    });

    if (!res.ok) {
        throw new Error("Failed to delete employee");
    }
}