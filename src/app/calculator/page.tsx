"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    SimpleGrid,
    Box,
    Text,
    Stack,
    Spinner,
} from "@chakra-ui/react";

import { Company } from "@/types/company.types";
import { PageHeader } from "@/components/page/PageHeader";
import { EmptyState } from "@/components/page/EmptyState";
import {companyService} from "@/service/company/company.service";

export default function CalculatorCompanyPage() {
    const router = useRouter();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        async function loadCompanies() {
            try {
                console.log("Start loading companies")
                // const res = await fetch("/api/external/company/for-user");
                // console.log(`Loading companies result: ${res.status}`)
                //
                // if (!res.ok) {
                //     throw new Error("Не удалось загрузить компании");
                // }

                // const data: Company[] = await res.json();

                const data = await companyService.getForUser()

                console.log("Companies data", data)

                // 🔁 автоскип
                if (data.length === 1) {
                    router.replace(
                        `/calculator/session?companyId=${data[0].id}`
                    );
                    return;
                }

                setCompanies(data);
            } catch (e) {
                setError("Ошибка загрузки");
            } finally {
                setLoading(false);
            }
        }

        loadCompanies();
    }, []);

    // ⏳ loading
    if (loading) {
        return (
            <Stack align="center" mt={10}>
                <Spinner size="lg" />
            </Stack>
        );
    }

    // ❌ error
    if (error) {
        return (
            <Stack gap={6}>
                <PageHeader title="Выбор компании" />
                <EmptyState title="Ошибка" description={error} />
            </Stack>
        );
    }

    return (
        <Stack gap={6}>
            <PageHeader title="Выбор компании" />

            {companies.length === 0 ? (
                <EmptyState
                    title="Нет доступных компаний"
                    description="Обратитесь к администратору"
                />
            ) : (
                <SimpleGrid columns={{ base: 1, md: 2 }} gap={4}>
                    {companies.map((company) => (
                        <Box
                            key={company.id}
                            p={5}
                            borderWidth="1px"
                            borderRadius="md"
                            cursor="pointer"
                            _hover={{ borderColor: "blue.500" }}
                            onClick={() =>
                                router.push(
                                    `/calculator/session?companyId=${company.id}`
                                )
                            }
                        >
                            <Text fontWeight="medium">{company.title}</Text>
                        </Box>
                    ))}
                </SimpleGrid>
            )}
        </Stack>
    );
}
