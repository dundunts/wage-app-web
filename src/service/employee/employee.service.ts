import {
    CompanyEmployeeInfo,
    CompanyEmployeesResponse,
    CreateEmployeePayload,
    Employee,
    EmployeePosition,
    UpdateEmployeePayload
} from "@/types/employee.types";
import {employeeApiClient, EmployeeApiClient} from "@/api/employee/employee.api.client";

export class EmployeeService {
    constructor(private readonly apiClient: EmployeeApiClient) {
    }

    async getById(id: string): Promise<Employee> {
        try {
            const response = await this.apiClient.fetchById(id)
            return response.data
        } catch (e) {
            console.error("Get employee by id error:", e)
            return Promise.reject(e)
        }
    }

    async getAll(): Promise<Employee[]> {
        try {
            const response = await this.apiClient.fetchAll()
            return response.data
        } catch (e) {
            console.error("Get employees error:", e)
            return Promise.reject(e)
        }
    }

    async getByCompanies(companyIds: string[]): Promise<CompanyEmployeesResponse[]> {
        try {
            const response = await this.apiClient.fetchByCompanies(companyIds)
            return response.data
        } catch (e) {
            console.error("Get employees by companies error:", e)
            return Promise.reject(e)
        }
    }

    async getCoworkers(): Promise<CompanyEmployeesResponse[]> {
        try {
            const response = await this.apiClient.fetchCoworkers()
            return response.data
        } catch (e) {
            console.error("Get employees-coworkers error:", e)
            return Promise.reject(e)
        }
    }

    async getCoworkersForCompany(companyId: string): Promise<CompanyEmployeeInfo[]> {
        const coworkersByCompany = await this.getCoworkers()
        return coworkersByCompany.find(info => info.companyId === companyId)?.data || []
    }

    async getAvailableEmployeesForCompany(companyId: string): Promise<CompanyEmployeeInfo[]> {
        const coworkers = await this.getCoworkersForCompany(companyId)
        return coworkers.filter(emp => emp.position === EmployeePosition.WAITER_ACTIVE)
    }

    async create(payload: CreateEmployeePayload): Promise<Employee> {
        try {
            const response = await this.apiClient.create(payload)
            return response.data
        } catch (e) {
            console.error("Create employee error:", e)
            return Promise.reject(e)
        }
    }

    async update(id: string, payload: UpdateEmployeePayload): Promise<void> {
        try {
            await this.apiClient.update(id, payload)
        } catch (e) {
            console.error("Update employee error:", e)
            return Promise.reject(e)
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.apiClient.delete(id)
        } catch (e) {
            console.error("Delete employee error:", e)
            return Promise.reject(e)
        }
    }
}

export const employeeService = new EmployeeService(employeeApiClient)