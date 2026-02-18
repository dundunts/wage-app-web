import {AxiosInstance, AxiosResponse} from "axios";
import {axiosBackendClient} from "@/api/config/api";
import {Company, CompanyPayload, UserCompaniesResponse} from "@/types/company.types";
import {Page} from "@/types/common.types";

export class CompanyApiClient {
    constructor(private readonly client: AxiosInstance) {
    }

    async fetchById(companyId: string): Promise<AxiosResponse<Company>> {
        return this.client.get(`/api/v1/company/get/${companyId}`)
    }

    async fetchForUser(): Promise<AxiosResponse<UserCompaniesResponse>> {
        return this.client.get("/api/v1/company/get/for-user")
    }

    async fetchPage(page: number, size: number): Promise<AxiosResponse<Page<Company>>> {
        return this.client.get("/api/external/company/get/page", {
            params: { page, size }
        })
    }

    async create(payload: CompanyPayload): Promise<AxiosResponse<Company>> {
        return this.client.post("/api/v1/company/create", payload)
    }

    async update(id: string, payload: CompanyPayload): Promise<AxiosResponse<void>> {
        return this.client.put(`/api/v1/company/update/${id}`, payload)
    }

    async delete(id: string): Promise<AxiosResponse<void>> {
        return this.client.delete(`/api/v1/company/delete/${id}`)
    }
}

export const companyApiClient = new CompanyApiClient(axiosBackendClient)