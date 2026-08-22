import {Company, CompanyPayload} from "@/types/company.types";
import {Page} from "@/types/common.types";
import {companyApiClient, CompanyApiClient} from "@/api/company/company.api.client";

interface GetCompanyPageParams {
    page?: number;
    size?: number;
    sort?: string;
}

export class CompanyService {
    constructor(private readonly apiClient: CompanyApiClient) {
    }

    async getById(companyId: string): Promise<Company> {
        const response = await this.apiClient.fetchById(companyId)
        return response.data
    }

    async getForUser(): Promise<Company[]> {
        const response = await this.apiClient.fetchForUser()
        return response.data.companies
    }

    async getPage(params: GetCompanyPageParams): Promise<Page<Company>> {
        const page = params.page || 0
        const size = params.size || 30

        const response = await this.apiClient.fetchPage(page, size)
        return response.data
    }

    async create(payload: CompanyPayload): Promise<Company> {
        const response = await this.apiClient.create(payload)
        return response.data
    }

    async update(id: string, payload: CompanyPayload): Promise<void> {
        await this.apiClient.update(id, payload)
    }

    async delete(id: string): Promise<void> {
        await this.apiClient.delete(id)
    }
}

export const companyService = new CompanyService(companyApiClient)
