export interface CompanyBindDataResponse<T> {
    companyId: string;
    data: T
}


export interface Page<T> {
    content: T[];
    totalElements: number;
    totalPages: number;
    size: number;
    number: number;
}