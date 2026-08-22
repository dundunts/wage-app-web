"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Button, Spinner, Stack, Text,} from "@chakra-ui/react";
import {Session} from "@/types/session.types";
import {PageHeader} from "@/components/page/PageHeader";
import {EmptyState} from "@/components/page/EmptyState";
import {SessionOpenDialog} from "@/components/session/session.open.dialog";
import {Company} from "@/types/company.types";
import {companyService} from "@/service/company/company.service";
import {sessionService} from "@/service/session/session.service";

const sessionStatusLabel: Record<Session["status"], string> = {
    OPENED: "Открыта",
    OPENED_DRAFT: "Черновик расчёта",
    CLOSED: "Закрыта",
    RECALCULATING: "Пересчитывается",
    RECALCULATING_DRAFT: "Черновик пересчитывается",
};

function SessionLoadError({message}: {message: string}) {
    return (
        <Stack role="alert" py={6} px={4} bg="bg.panel" borderWidth="1px" borderColor="status.danger" borderRadius="panel">
            <Text color="status.danger">{message}</Text>
        </Stack>
    );
}

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
            <Stack role="status" aria-label="Shift Session загружаются" align="center" py={10} color="fg.muted">
                <Spinner />
            </Stack>
        );
    }

    if (error) {
        return <SessionLoadError message={error} />;
    }

    if (!company) {
        return <SessionLoadError message="Компания не загружена" />;
    }

    return (
        <Stack gap={6}>
            <PageHeader
                title="Shift Session"
                description={(
                    <Text color="fg.muted" fontSize="sm">
                        Этап 1 · {company.title}: выберите открытую Shift Session или начните новую.
                    </Text>
                )}
            />

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
                <Button
                    type="button"
                    key={session.id}
                    p={5}
                    borderWidth="1px"
                    borderColor="border"
                    borderRadius="panel"
                    bg="bg.panel"
                    boxShadow="panel"
                    display="block"
                    h="auto"
                    textAlign="left"
                    w="full"
                    cursor="pointer"
                    transitionDuration="quiet"
                    _hover={{ borderColor: "accent.border", bg: "bg.raised" }}
                    _focusVisible={{outlineWidth: "2px", outlineColor: "focus.ring"}}
                    _motionReduce={{transitionDuration: "0ms"}}
                    onClick={() =>
                        router.push(
                            `/calculator/checkpoints?sessionId=${session.id}`
                        )
                    }
                >
                    <Text as="span" display="block" fontWeight="medium">
                        {session.date.toLocaleString()} — {session.startWorkTime}
                    </Text>
                    <Text as="span" display="block" mt={1} fontSize="sm" color="fg.muted">
                        Статус: {sessionStatusLabel[session.status]}
                    </Text>
                </Button>
            ))}
        </Stack>
    );
}
