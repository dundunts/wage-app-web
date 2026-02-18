import {AxiosInstance, AxiosResponse} from "axios";
import {axiosBackendClient} from "@/api/config/api";
import {CompanyEmployeesResponse, CreateEmployeePayload, Employee, UpdateEmployeePayload} from "@/types/employee.types";

export class EmployeeApiClient {
    constructor(private readonly client: AxiosInstance) {
    }

    async fetchById(id: string): Promise<AxiosResponse<Employee>> {
        return this.client.get(`/api/v1/employee/get/${id}`)
    }

    async fetchAll(): Promise<AxiosResponse<Employee[]>> {
        return this.client.get("/api/v1/employee/get/all")
    }

    async fetchByCompanies(companyIds: string[]): Promise<AxiosResponse<CompanyEmployeesResponse[]>> {
        return this.client.get("/api/v1/employee/get/by-companies", {
            params: { companyIds }
        })
    }

    async fetchCoworkers(): Promise<AxiosResponse<CompanyEmployeesResponse[]>> {
        return this.client.get("/api/v1/employee/get/coworkers")
    }

    async create(payload: CreateEmployeePayload): Promise<AxiosResponse<Employee>> {
        return this.client.post("/api/v1/employee/create", payload)
    }

    async update(id: string, payload: UpdateEmployeePayload): Promise<AxiosResponse<void>> {
        return this.client.put(`/api/v1/employee/update/${id}`, payload)
    }

    async delete(id: string): Promise<AxiosResponse<void>> {
        return this.client.delete(`/api/v1/employee/delete/${id}`)
    }
}

export const employeeApiClient = new EmployeeApiClient(axiosBackendClient)