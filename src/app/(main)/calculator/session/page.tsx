"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Box, Spinner, Stack, Text,} from "@chakra-ui/react";
import {Session} from "@/types/session.types";
import {PageHeader} from "@/components/page/PageHeader";
import {EmptyState} from "@/components/page/EmptyState";
import {SessionOpenDialog} from "@/components/session/session.open.dialog";
import {Company} from "@/types/company.types";
import {companyService} from "@/service/company/company.service";
import {sessionService} from "@/service/session/session.service";

export default function SessionPage() {
    const router = useRouter();
    const searchParams = useSearchParams();

    const companyId = searchParams.get("companyId");

    const [sessions, setSessions] = useState<Session[]>([]);
    const [company, setCompany] = useState<Company | undefined>(undefined)
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    // 📦 загрузка сессий
    useEffect(() => {
        async function loadData() {
            if (!companyId) {
                router.push("/calculator");
                return
            }

            setLoading(true);
            
            try {
                const company = await companyService.getById(companyId)
                setCompany(company)

                const sessions = await sessionService.getAllAvailableByCompany(companyId)
                setSessions(sessions)
            } catch (e) {
                console.error("Error while loading data", e)
                setError("Error while loading data")
            } finally {
                setLoading(false)
            }
        }

        loadData()
    }, [companyId, router]);

    const openedSessions = useMemo(
        () =>
            sessions.filter((s) =>
                ["OPENED", "OPENED_DRAFT"].includes(s.status)
            ),
        [sessions]
    );

    // 🔁 автоскип при одной сессии
    useEffect(() => {
        if (openedSessions.length === 1) {
            router.push(
                `/calculator/checkpoints?sessionId=${openedSessions[0].id}`
            );
        }
    }, [openedSessions, router]);

    if (loading) {
        return (
            <Stack align="center" py={10}>
                <Spinner />
            </Stack>
        );
    }

    if (error) {
        return (
            <Stack py={6}>
                <Text color="red.500">{error}</Text>
            </Stack>
        );
    }

    if (!company) {
        return (
            <Stack py={6}>
                <Text color="red.500">Компания не загружена</Text>
            </Stack>
        );
    }

    return (
        <Stack gap={6}>
            <PageHeader title="Выбор сессии" />

            {openedSessions.length === 0 && companyId && (
                <>
                    <EmptyState
                        title="Нет открытых сессий"
                        description="Откройте новую сессию для начала работы"
                    />
                    <SessionOpenDialog company={company} />
                </>
            )}

            {openedSessions.map((session) => (
                <Box
                    key={session.id}
                    p={5}
                    borderWidth="1px"
                    borderRadius="md"
                    cursor="pointer"
                    _hover={{ borderColor: "blue.500" }}
                    onClick={() =>
                        router.push(
                            `/calculator/checkpoints?sessionId=${session.id}`
                        )
                    }
                >
                    <Text fontWeight="medium">
                        {session.date.toLocaleString()} — {session.startWorkTime}
                    </Text>
                    <Text fontSize="sm" color="gray.500">
                        {session.status}
                    </Text>
                </Box>
            ))}
        </Stack>
    );
}
