"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import {
    Button,
    Container,
    Flex,
    SimpleGrid,
    Text,
    Stack,
    Spinner,
} from "@chakra-ui/react";
import {ArrowRight} from "lucide-react";

import { Company } from "@/types/company.types";
import { PageHeader } from "@/components/page/PageHeader";
import { EmptyState } from "@/components/page/EmptyState";
import {companyService} from "@/service/company/company.service";

interface CompanyChoiceGridProps {
    companies: Company[];
    selectedCompanyId: string | null;
    onSelect: (companyId: string) => void;
}

function CompanyChoiceGrid({
                                      companies,
                                      selectedCompanyId,
                                      onSelect,
                                  }: CompanyChoiceGridProps) {
    return (
        <SimpleGrid columns={{base: 1, md: 2}} gap={4}>
            {companies.map((company) => (
                <Button
                    key={company.id}
                    type="button"
                    variant="outline"
                    colorPalette="brand"
                    aria-label={`Выбрать компанию «${company.title}»`}
                    aria-pressed={selectedCompanyId === company.id}
                    h="auto"
                    minH="6rem"
                    w="full"
                    minW={0}
                    p={5}
                    layerStyle="panel"
                    borderColor={selectedCompanyId === company.id ? "accent" : "border"}
                    bg={selectedCompanyId === company.id ? "accent.subtle" : "bg.panel"}
                    boxShadow={selectedCompanyId === company.id ? "accent" : "panel"}
                    whiteSpace="normal"
                    textAlign="start"
                    _hover={{
                        borderColor: "accent.border",
                        bg: "accent.subtle",
                        transform: "translateY(-1px)",
                    }}
                    _active={{
                        borderColor: "accent",
                        bg: "accent.subtle",
                        transform: "translateY(0)",
                    }}
                    _motionReduce={{transform: "none"}}
                    onClick={() => onSelect(company.id)}
                >
                    <Flex align="center" justify="space-between" gap={4} w="full" minW={0}>
                        <Stack gap={1} minW={0}>
                            <Text color="fg.muted" fontSize="xs" fontWeight="700" textTransform="uppercase">
                                Рабочая точка
                            </Text>
                            <Text color="fg" fontWeight="700" overflowWrap="anywhere">
                                {company.title}
                            </Text>
                        </Stack>
                        <ArrowRight aria-hidden="true" size={18} />
                    </Flex>
                </Button>
            ))}
        </SimpleGrid>
    );
}

export default function CalculatorCompanyPage() {
    const router = useRouter();

    const [companies, setCompanies] = useState<Company[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedCompanyId, setSelectedCompanyId] = useState<string | null>(null);

    useEffect(() => {
        async function loadCompanies() {
            try {
                const data = await companyService.getForUser()

                // 🔁 автоскип
                if (data.length === 1) {
                    router.replace(
                        `/calculator/session?companyId=${data[0].id}`
                    );
                    return;
                }

                setCompanies(data);
            } catch {
                setError("Ошибка загрузки");
            } finally {
                setLoading(false);
            }
        }

        loadCompanies();
    }, [router]);

    const selectCompany = (companyId: string) => {
        setSelectedCompanyId(companyId);
        router.push(`/calculator/session?companyId=${companyId}`);
    };

    // ⏳ loading
    if (loading) {
        return (
            <Stack role="status" aria-label="Company загружаются" align="center" py={10}>
                <Spinner size="lg" />
            </Stack>
        );
    }

    // ❌ error
    if (error) {
        return (
            <Container maxW="5xl" px={{base: 4, md: 6}} py={{base: 6, md: 8}}>
                <Stack gap={6}>
                    <PageHeader
                        title="Выбор компании"
                        description="Выберите рабочую точку для расчёта смены"
                    />
                    <EmptyState title="Ошибка" description={error} />
                </Stack>
            </Container>
        );
    }

    return (
        <Container maxW="5xl" px={{base: 4, md: 6}} py={{base: 6, md: 8}}>
            <Stack gap={6}>
                <PageHeader
                    title="Выбор компании"
                    description="Выберите рабочую точку для расчёта смены"
                />

                {companies.length === 0 ? (
                    <EmptyState
                        title="Нет доступных компаний"
                        description="Обратитесь к администратору"
                    />
                ) : (
                    <CompanyChoiceGrid
                        companies={companies}
                        selectedCompanyId={selectedCompanyId}
                        onSelect={selectCompany}
                    />
                )}
            </Stack>
        </Container>
    );
}
