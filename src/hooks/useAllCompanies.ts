// @/hooks/useAllCompanies.ts
import { useEffect, useState } from "react";
import { getCompaniesPage } from "@/service/company/company.service";
import { Company } from "@/types/company.types";

interface UseAllCompaniesReturn {
    companies: Company[];
    isLoading: boolean;
    isError: boolean;
}

export function useAllCompanies(): UseAllCompaniesReturn {
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isError, setIsError] = useState(false);

    useEffect(() => {
        let mounted = true;

        const fetchCompanies = async () => {
            try {
                setIsLoading(true);
                // Запрашиваем с запасом, как указано в ТЗ
                const data = await getCompaniesPage({ page: 0, size: 100 });
                if (mounted) {
                    setCompanies(data.content);
                }
            } catch (error) {
                console.error("Failed to fetch companies", error);
                if (mounted) {
                    setIsError(true);
                }
            } finally {
                if (mounted) {
                    setIsLoading(false);
                }
            }
        };

        fetchCompanies();

        return () => {
            mounted = false;
        };
    }, []);

    return { companies, isLoading, isError };
}