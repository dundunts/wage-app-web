"use client";

import {useEffect, useMemo, useState} from "react";
import {useRouter, useSearchParams} from "next/navigation";
import {Box, Button, Flex, Heading, HStack, Spinner, Stack, Text,} from "@chakra-ui/react";
import {Clock3} from "lucide-react";
import {Session} from "@/types/session.types";
import {SessionOpenDialog} from "@/components/session/session.open.dialog";
import {Company} from "@/types/company.types";
import {companyService} from "@/service/company/company.service";
import {sessionService} from "@/service/session/session.service";
import {
    CalculatorStageContainer,
    CalculatorStageHeader,
} from "@/components/calculator/calculator-stage";

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
            <CalculatorStageContainer>
                <Stack role="status" aria-label="Shift Session загружаются" align="center" py={10} color="fg.muted">
                    <Spinner />
                </Stack>
            </CalculatorStageContainer>
        );
    }

    if (error) {
        return (
            <CalculatorStageContainer>
                <SessionLoadError message={error} />
            </CalculatorStageContainer>
        );
    }

    if (!company) {
        return (
            <CalculatorStageContainer>
                <SessionLoadError message="Компания не загружена" />
            </CalculatorStageContainer>
        );
    }

    return (
        <CalculatorStageContainer>
            <Stack gap={6}>
                <CalculatorStageHeader
                    currentStage={1}
                    title="Shift Session"
                    description={`Выберите открытую Shift Session или начните новую для рабочей точки ${company.title}.`}
                />

                {openedSessions.length === 0 && companyId && (
                    <Stack gap={4}>
                        <Stack
                            position="relative"
                            overflow="hidden"
                            layerStyle="panel"
                            p={{base: 8, md: 10}}
                            align="center"
                            textAlign="center"
                            backgroundImage="radial-gradient(circle at 50% 0%, {colors.glass.glow}, transparent 36%), linear-gradient(145deg, {colors.bg.panel}, {colors.bg.raised})"
                        >
                            <Flex
                                align="center"
                                justify="center"
                                w={18}
                                h={18}
                                color="accent"
                                bg="glass.activeMid"
                                backgroundImage="linear-gradient(145deg, {colors.glass.activeStart}, {colors.glass.activeMid})"
                                borderWidth="1px"
                                borderColor="glass.border"
                                borderRadius="glassControl"
                                boxShadow="glassAction"
                                transform="rotate(-3deg)"
                                _motionReduce={{transform: "none"}}
                            >
                                <Clock3 aria-hidden="true" size={32} />
                            </Flex>
                            <Heading as="h2" mt={2} size="md" color="fg">
                                Начните новую смену
                            </Heading>
                            <Text maxW="lg" fontSize="sm" color="fg.muted">
                                Открытых сессий пока нет. Укажите время начала, чтобы перейти к фиксации Revenue,
                                Restaurant Tips и состава команды.
                            </Text>
                            <HStack
                                mt={2}
                                px={3}
                                py={2}
                                color="fg.muted"
                                bg="bg.canvas"
                                borderWidth="1px"
                                borderColor="border"
                                borderRadius="full"
                                aria-label={`Рабочая точка: ${company.title}`}
                            >
                                <Box
                                    aria-hidden="true"
                                    w="6px"
                                    h="6px"
                                    bg="accent"
                                    borderRadius="full"
                                    boxShadow="accent"
                                />
                                <Text fontSize="xs">{company.title}</Text>
                            </HStack>
                        </Stack>
                        <Flex justify="center" w="full">
                            <SessionOpenDialog company={company} />
                        </Flex>
                    </Stack>
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
        </CalculatorStageContainer>
    );
}
