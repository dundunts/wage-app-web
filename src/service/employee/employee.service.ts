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
        const response = await this.apiClient.fetchById(id)
        return response.data
    }

    async getAll(): Promise<Employee[]> {
        const response = await this.apiClient.fetchAll()
        return response.data
    }

    async getByCompanies(companyIds: string[]): Promise<CompanyEmployeesResponse[]> {
        const response = await this.apiClient.fetchByCompanies(companyIds)
        return response.data
    }

    async getCoworkers(): Promise<CompanyEmployeesResponse[]> {
        const response = await this.apiClient.fetchCoworkers()
        return response.data
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
        const response = await this.apiClient.create(payload)
        return response.data
    }

    async update(id: string, payload: UpdateEmployeePayload): Promise<void> {
        await this.apiClient.update(id, payload)
    }

    async delete(id: string): Promise<void> {
        await this.apiClient.delete(id)
    }
}

export const employeeService = new EmployeeService(employeeApiClient)
