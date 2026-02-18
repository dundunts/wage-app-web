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
        try {
            const response = await this.apiClient.fetchById(companyId)
            return response.data
        } catch (e) {
            console.error("Get company by id error:", e)
            return Promise.reject(e)
        }
    }

    async getForUser(): Promise<Company[]> {
        try {
            const response = await this.apiClient.fetchForUser()
            return response.data.companies
        } catch (e) {
            console.error("Get companies for user error:", e)
            return Promise.reject(e)
        }
    }

    async getPage(params: GetCompanyPageParams): Promise<Page<Company>> {
        try {
            const page = params.page || 0
            const size = params.size || 30

            const response = await this.apiClient.fetchPage(page, size)
            return response.data
        } catch (e) {
            console.error("Get companies page error:", e)
            return Promise.reject(e)
        }
    }

    async create(payload: CompanyPayload): Promise<Company> {
        try {
            const response = await this.apiClient.create(payload)
            return response.data
        } catch (e) {
            console.error("Create company error:", e)
            return Promise.reject(e)
        }
    }

    async update(id: string, payload: CompanyPayload): Promise<void> {
        try {
            await this.apiClient.update(id, payload)
        } catch (e) {
            console.error("Update company error:", e)
            return Promise.reject(e)
        }
    }

    async delete(id: string): Promise<void> {
        try {
            await this.apiClient.delete(id)
        } catch (e) {
            console.error("Delete company error:", e)
            return Promise.reject(e)
        }
    }
}

export const companyService = new CompanyService(companyApiClient)