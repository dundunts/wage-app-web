"use client";

// PROTOTYPE — throw away after the visual direction is selected.
// Three variants of the WageApp dark theme, switchable via ?variant=, on /prototype/theme.

import "@fontsource-variable/manrope";

import {
    Avatar,
    Badge,
    Box,
    Button,
    Container,
    Flex,
    Grid,
    GridItem,
    Heading,
    HStack,
    IconButton,
    SimpleGrid,
    Table,
    Text,
    VStack,
} from "@chakra-ui/react";
import {
    ArrowUpRight,
    Bell,
    CalendarDays,
    Check,
    ChevronDown,
    CircleDollarSign,
    Clock3,
    Download,
    LayoutDashboard,
    Menu,
    MoreHorizontal,
    Plus,
    Search,
    Sparkles,
    Users,
    WalletCards,
} from "lucide-react";
import {PrototypeSwitcher} from "@/components/prototype/PrototypeSwitcher";

export type ThemePrototypeVariant = "A" | "B" | "C";

const PALETTE = {
    canvas: "#0d0d0c",
    canvasWarm: "#12110f",
    surface: "#171613",
    surfaceRaised: "#1e1c18",
    surfaceSoft: "#24211c",
    border: "rgba(244, 240, 232, 0.10)",
    borderStrong: "rgba(244, 240, 232, 0.17)",
    text: "#f4f0e8",
    muted: "#a9a39a",
    quiet: "#706b64",
    teal: "#32f5d2",
    tealSolid: "#0f766e",
    tealSoft: "rgba(50, 245, 210, 0.10)",
    tealBorder: "rgba(50, 245, 210, 0.30)",
    green: "#5dd39e",
    blue: "#75a7ff",
    amber: "#e5b567",
    red: "#ff7a7a",
    violet: "#a98cff",
} as const;

const employees = [
    {name: "Алина Смирнова", role: "Официант", shifts: 14, hours: "118 ч", payout: "92 480 ₽", delta: "+8.4%", status: "Готово"},
    {name: "Максим Петров", role: "Бармен", shifts: 12, hours: "104 ч", payout: "84 720 ₽", delta: "+2.1%", status: "Готово"},
    {name: "Нина Волкова", role: "Менеджер", shifts: 10, hours: "96 ч", payout: "78 350 ₽", delta: "−1.8%", status: "Проверить"},
    {name: "Илья Орлов", role: "Повар", shifts: 13, hours: "121 ч", payout: "76 910 ₽", delta: "+5.7%", status: "Готово"},
    {name: "Софья Лебедева", role: "Хостес", shifts: 9, hours: "72 ч", payout: "54 180 ₽", delta: "+3.2%", status: "Черновик"},
];

const variantNames: Record<ThemePrototypeVariant, string> = {
    A: "Тихий реестр",
    B: "Неоновый пульт",
    C: "Тёплый отчёт",
};

const variantStates: Record<ThemePrototypeVariant, string> = {
    A: "warm graphite · restrained neon · data first",
    B: "command rail · stronger glow · operational",
    C: "editorial hierarchy · spacious · calm teal",
};

export function ThemePrototype({variant}: {variant: ThemePrototypeVariant}) {
    return (
        <Box
            minH="100dvh"
            bg={PALETTE.canvas}
            color={PALETTE.text}
            fontFamily="Manrope Variable, Manrope, sans-serif"
            fontFeatureSettings="'tnum' 1, 'ss01' 1"
            css={{
                "&, & *": {
                    fontFamily: "'Manrope Variable', Manrope, sans-serif !important",
                },
            }}
        >
            {variant === "A" && <VariantA/>}
            {variant === "B" && <VariantB/>}
            {variant === "C" && <VariantC/>}
            <PrototypeSwitcher
                current={variant}
                variants={["A", "B", "C"] as const}
                names={variantNames}
                stateSummary={variantStates[variant]}
            />
        </Box>
    );
}

function PrototypeMark() {
    return (
        <Badge
            bg="rgba(229,181,103,.12)"
            color={PALETTE.amber}
            border="1px solid rgba(229,181,103,.24)"
            borderRadius="full"
            px={2.5}
            py={1}
            fontSize="10px"
            letterSpacing=".1em"
        >
            PROTOTYPE
        </Badge>
    );
}

function TealButton({children}: {children: React.ReactNode}) {
    return (
        <Button
            bg={PALETTE.tealSolid}
            color="white"
            borderRadius="8px"
            boxShadow="0 0 0 1px rgba(50,245,210,.18), 0 10px 30px rgba(15,118,110,.22)"
            _hover={{bg: "#11877e", transform: "translateY(-1px)"}}
            transition="all 160ms ease"
        >
            {children}
        </Button>
    );
}

function Metric({label, value, delta, tone = "teal"}: {label: string; value: string; delta: string; tone?: "teal" | "amber" | "blue"}) {
    const accent = tone === "teal" ? PALETTE.teal : tone === "amber" ? PALETTE.amber : PALETTE.blue;
    return (
        <Box
            bg={PALETTE.surface}
            border="1px solid"
            borderColor={PALETTE.border}
            borderRadius="12px"
            p={{base: 4, md: 5}}
            position="relative"
            overflow="hidden"
        >
            <Box position="absolute" top="-30px" right="-30px" w="90px" h="90px" bg={accent} opacity=".07" filter="blur(24px)"/>
            <Text color={PALETTE.muted} fontSize="xs" fontWeight="700" letterSpacing=".06em" textTransform="uppercase">{label}</Text>
            <HStack mt={3} justify="space-between" align="end">
                <Text fontSize={{base: "2xl", md: "3xl"}} fontWeight="700" letterSpacing="-.04em">{value}</Text>
                <Badge bg={`${accent}18`} color={accent} borderRadius="full" px={2} py={1}>{delta}</Badge>
            </HStack>
        </Box>
    );
}

function VariantA() {
    return (
        <Box minH="100dvh" pb={28} bg={`radial-gradient(circle at 80% -10%, rgba(50,245,210,.055), transparent 32%), ${PALETTE.canvasWarm}`}>
            <Box
                as="header"
                position="sticky"
                top={0}
                zIndex={10}
                bg="rgba(18,17,15,.84)"
                backdropFilter="blur(18px)"
                borderBottom="1px solid"
                borderColor={PALETTE.border}
            >
                <Container maxW="1400px" px={{base: 4, md: 8}}>
                    <Flex h="68px" align="center" justify="space-between">
                        <HStack gap={7}>
                            <HStack gap={2.5}>
                                <Flex w="28px" h="28px" borderRadius="8px" bg={PALETTE.teal} color="#062d28" align="center" justify="center">
                                    <CircleDollarSign size={17} strokeWidth={2.4}/>
                                </Flex>
                                <Text fontWeight="800" letterSpacing="-.04em">WageApp</Text>
                            </HStack>
                            <HStack gap={1} display={{base: "none", lg: "flex"}}>
                                {["Обзор", "Смены", "Сотрудники", "Отчёты"].map((item, index) => (
                                    <Button
                                        key={item}
                                        variant="ghost"
                                        color={index === 0 ? PALETTE.text : PALETTE.muted}
                                        borderRadius="8px"
                                        position="relative"
                                        _hover={{bg: PALETTE.tealSoft, color: PALETTE.text}}
                                    >
                                        {item}
                                        {index === 0 && <Box position="absolute" h="2px" bg={PALETTE.teal} left={3} right={3} bottom="-12px" boxShadow={`0 0 12px ${PALETTE.teal}`}/>}
                                    </Button>
                                ))}
                            </HStack>
                        </HStack>
                        <HStack>
                            <PrototypeMark/>
                            <IconButton aria-label="Уведомления" variant="ghost" color={PALETTE.muted} display={{base: "none", sm: "inline-flex"}}><Bell size={18}/></IconButton>
                            <Avatar.Root size="sm" bg={PALETTE.surfaceSoft} color={PALETTE.text}><Avatar.Fallback name="Анна К."/></Avatar.Root>
                        </HStack>
                    </Flex>
                </Container>
            </Box>

            <Container maxW="1400px" px={{base: 4, md: 8}} py={{base: 7, md: 10}}>
                <Flex justify="space-between" align={{base: "start", md: "end"}} gap={5} direction={{base: "column", md: "row"}} mb={8}>
                    <Box>
                        <Text color={PALETTE.teal} fontSize="xs" fontWeight="800" letterSpacing=".12em" textTransform="uppercase">Август · период открыт</Text>
                        <Heading mt={2} fontSize={{base: "3xl", md: "44px"}} lineHeight="1.05" letterSpacing="-.05em">Расчёт зарплаты</Heading>
                        <Text mt={3} color={PALETTE.muted}>Сводка по компании «Север» за 1–15 августа</Text>
                    </Box>
                    <HStack gap={2} w={{base: "full", md: "auto"}}>
                        <Button flex={{base: 1, md: "initial"}} variant="outline" borderColor={PALETTE.borderStrong} color={PALETTE.text} borderRadius="8px"><Download size={17}/> Экспорт</Button>
                        <Box flex={{base: 1, md: "initial"}}><TealButton><Plus size={17}/> Новая смена</TealButton></Box>
                    </HStack>
                </Flex>

                <SimpleGrid columns={{base: 1, sm: 2, xl: 4}} gap={3}>
                    <Metric label="Фонд выплат" value="1 284 600 ₽" delta="+6.8%"/>
                    <Metric label="Выручка" value="4 920 000 ₽" delta="+9.2%" tone="blue"/>
                    <Metric label="Часы" value="1 846" delta="+3.1%" tone="amber"/>
                    <Metric label="Смены" value="186" delta="12 открыто"/>
                </SimpleGrid>

                <Grid templateColumns={{base: "1fr", xl: "minmax(0, 1fr) 320px"}} gap={4} mt={4}>
                    <GridItem bg={PALETTE.surface} border="1px solid" borderColor={PALETTE.border} borderRadius="12px" overflow="hidden">
                        <Flex p={5} justify="space-between" align="center" borderBottom="1px solid" borderColor={PALETTE.border}>
                            <Box><Heading fontSize="lg" letterSpacing="-.025em">Выплаты сотрудникам</Heading><Text color={PALETTE.muted} fontSize="sm" mt={1}>42 сотрудника · обновлено 8 минут назад</Text></Box>
                            <IconButton aria-label="Дополнительные действия" variant="ghost" color={PALETTE.muted}><MoreHorizontal size={19}/></IconButton>
                        </Flex>
                        <Box overflowX="auto">
                            <Table.Root minW="760px" size="sm">
                                <Table.Header bg="rgba(244,240,232,.025)">
                                    <Table.Row borderColor={PALETTE.border}>
                                        {['Сотрудник', 'Смены', 'Часы', 'Динамика', 'К выплате', 'Статус'].map((label) => <Table.ColumnHeader key={label} color={PALETTE.quiet} fontSize="10px" letterSpacing=".08em" py={3}>{label}</Table.ColumnHeader>)}
                                    </Table.Row>
                                </Table.Header>
                                <Table.Body>
                                    {employees.map((employee) => (
                                        <Table.Row key={employee.name} borderColor={PALETTE.border} transition="background 140ms ease" _hover={{bg: PALETTE.tealSoft}}>
                                            <Table.Cell py={3.5}><Text fontWeight="700">{employee.name}</Text><Text color={PALETTE.quiet} fontSize="xs">{employee.role}</Text></Table.Cell>
                                            <Table.Cell color={PALETTE.muted}>{employee.shifts}</Table.Cell>
                                            <Table.Cell color={PALETTE.muted}>{employee.hours}</Table.Cell>
                                            <Table.Cell color={employee.delta.startsWith("−") ? PALETTE.red : PALETTE.green}>{employee.delta}</Table.Cell>
                                            <Table.Cell fontWeight="800">{employee.payout}</Table.Cell>
                                            <Table.Cell><StatusBadge status={employee.status}/></Table.Cell>
                                        </Table.Row>
                                    ))}
                                </Table.Body>
                            </Table.Root>
                        </Box>
                    </GridItem>

                    <GridItem bg={PALETTE.surface} border="1px solid" borderColor={PALETTE.border} borderRadius="12px" p={5}>
                        <Heading fontSize="lg" letterSpacing="-.025em">Перед закрытием</Heading>
                        <VStack mt={5} gap={4} align="stretch">
                            <CheckItem done label="Выручка загружена" detail="15 из 15 смен"/>
                            <CheckItem done label="Чаевые распределены" detail="184 200 ₽"/>
                            <CheckItem label="Проверить 2 выплаты" detail="Есть отклонения"/>
                            <CheckItem label="Подтвердить период" detail="До 18 августа"/>
                        </VStack>
                        <Button mt={6} w="full" bg={PALETTE.tealSoft} color={PALETTE.teal} border="1px solid" borderColor={PALETTE.tealBorder} borderRadius="8px" _hover={{bg: "rgba(50,245,210,.16)"}}>Перейти к проверке</Button>
                    </GridItem>
                </Grid>
            </Container>
        </Box>
    );
}

function VariantB() {
    const nav = [
        {label: "Пульс", icon: LayoutDashboard},
        {label: "Команда", icon: Users},
        {label: "Смены", icon: Clock3},
        {label: "Выплаты", icon: WalletCards},
    ];

    return (
        <Grid minH="100dvh" pb={{base: 28, lg: 0}} templateColumns={{base: "1fr", lg: "250px minmax(0,1fr)"}} bg="#0a0b0a">
            <GridItem
                display={{base: "none", lg: "flex"}}
                as="aside"
                direction="column"
                borderRight="1px solid"
                borderColor={PALETTE.border}
                bg="#10110f"
                px={4}
                py={5}
            >
                <HStack px={2} gap={3}>
                    <Flex w="34px" h="34px" borderRadius="9px" bg={PALETTE.teal} color="#032c27" align="center" justify="center" boxShadow="0 0 28px rgba(50,245,210,.25)"><Sparkles size={18}/></Flex>
                    <Box><Text fontWeight="800" letterSpacing="-.04em">WageApp</Text><Text fontSize="10px" color={PALETTE.quiet} letterSpacing=".12em">OPERATIONS</Text></Box>
                </HStack>
                <VStack mt={10} gap={1} align="stretch">
                    {nav.map(({label, icon: Icon}, index) => (
                        <Button key={label} justifyContent="flex-start" variant="ghost" borderRadius="8px" bg={index === 0 ? PALETTE.tealSoft : "transparent"} color={index === 0 ? PALETTE.teal : PALETTE.muted} border={index === 0 ? "1px solid" : undefined} borderColor={PALETTE.tealBorder} _hover={{bg: PALETTE.surfaceSoft, color: PALETTE.text}}>
                            <Icon size={17}/>{label}
                        </Button>
                    ))}
                </VStack>
                <Box mt="auto" bg={PALETTE.surface} border="1px solid" borderColor={PALETTE.border} borderRadius="12px" p={4}>
                    <HStack justify="space-between"><Text color={PALETTE.muted} fontSize="xs">Синхронизация</Text><Box w="7px" h="7px" bg={PALETTE.teal} borderRadius="full" boxShadow={`0 0 10px ${PALETTE.teal}`}/></HStack>
                    <Text mt={2} fontSize="sm" fontWeight="700">Все данные актуальны</Text>
                    <Text mt={1} fontSize="xs" color={PALETTE.quiet}>12 секунд назад</Text>
                </Box>
            </GridItem>

            <GridItem minW={0} bg={`radial-gradient(circle at 42% 18%, rgba(50,245,210,.075), transparent 22%), #0a0b0a`}>
                <Flex h="68px" px={{base: 4, md: 7}} align="center" justify="space-between" borderBottom="1px solid" borderColor={PALETTE.border} bg="rgba(10,11,10,.75)" backdropFilter="blur(18px)">
                    <HStack>
                        <IconButton display={{base: "inline-flex", lg: "none"}} aria-label="Меню" variant="ghost"><Menu size={19}/></IconButton>
                        <Box><Text fontSize="10px" color={PALETTE.teal} letterSpacing=".13em" fontWeight="800">LIVE WORKSPACE</Text><Text fontSize="sm" fontWeight="700">Компания «Север»</Text></Box>
                    </HStack>
                    <HStack><PrototypeMark/><IconButton aria-label="Поиск" variant="ghost" color={PALETTE.muted}><Search size={18}/></IconButton><IconButton aria-label="Уведомления" variant="ghost" color={PALETTE.muted}><Bell size={18}/></IconButton></HStack>
                </Flex>

                <Box px={{base: 4, md: 7}} py={{base: 6, md: 8}}>
                    <Flex justify="space-between" align={{base: "start", md: "center"}} direction={{base: "column", md: "row"}} gap={4}>
                        <Box><Heading fontSize={{base: "3xl", md: "40px"}} letterSpacing="-.05em">Операционный пульс</Heading><Text mt={2} color={PALETTE.muted}>Сегодня, 15 августа · 18:42</Text></Box>
                        <TealButton><Plus size={17}/> Закрыть смену</TealButton>
                    </Flex>

                    <Grid mt={7} templateColumns={{base: "1fr", md: "repeat(2, minmax(0, 1fr))", xl: "minmax(0, 1.55fr) minmax(300px, .65fr)"}} gap={4}>
                        <GridItem minH="320px" bg="rgba(23,22,19,.88)" border="1px solid" borderColor={PALETTE.tealBorder} borderRadius="12px" p={{base: 5, md: 6}} boxShadow="0 24px 80px rgba(0,0,0,.25), inset 0 1px rgba(255,255,255,.03)">
                            <Flex justify="space-between" align="start"><Box><Text color={PALETTE.muted} fontSize="xs" fontWeight="700">ВЫПЛАТЫ · 14 ДНЕЙ</Text><Text mt={2} fontSize="4xl" fontWeight="750" letterSpacing="-.05em">1.28 млн ₽</Text></Box><Badge bg={PALETTE.tealSoft} color={PALETTE.teal} borderRadius="full" px={2.5} py={1}><ArrowUpRight size={13}/> 6.8%</Badge></Flex>
                            <EarningsChart/>
                            <HStack mt={2} gap={5}><Legend color={PALETTE.teal} label="Выплаты"/><Legend color={PALETTE.violet} label="Чаевые"/></HStack>
                        </GridItem>

                        <GridItem bg={PALETTE.surface} border="1px solid" borderColor={PALETTE.border} borderRadius="12px" p={5}>
                            <Text color={PALETTE.muted} fontSize="xs" fontWeight="700">СЕЙЧАС НА СМЕНЕ</Text>
                            <HStack mt={4} align="end"><Text fontSize="5xl" fontWeight="750" letterSpacing="-.06em">18</Text><Text pb={2} color={PALETTE.muted}>из 24</Text></HStack>
                            <Box mt={5} h="7px" bg="#2a2823" borderRadius="full" overflow="hidden"><Box w="75%" h="full" bg={`linear-gradient(90deg, ${PALETTE.tealSolid}, ${PALETTE.teal})`} boxShadow={`0 0 16px ${PALETTE.teal}`}/></Box>
                            <SimpleGrid columns={2} gap={2} mt={6}>
                                <MiniStat value="6" label="Зал"/><MiniStat value="4" label="Кухня"/><MiniStat value="5" label="Бар"/><MiniStat value="3" label="Менеджеры"/>
                            </SimpleGrid>
                        </GridItem>

                        <GridItem bg={PALETTE.surface} border="1px solid" borderColor={PALETTE.border} borderRadius="12px" p={5}>
                            <Flex justify="space-between" align="center"><Heading fontSize="lg">Требуют внимания</Heading><Badge bg="rgba(229,181,103,.12)" color={PALETTE.amber} borderRadius="full">3 события</Badge></Flex>
                            <VStack mt={4} align="stretch" gap={1}>
                                <AlertRow color={PALETTE.amber} title="Смена без выручки" meta="Петроградская · 14 августа"/>
                                <AlertRow color={PALETTE.red} title="Расхождение выплаты" meta="Нина Волкова · 4 240 ₽"/>
                                <AlertRow color={PALETTE.blue} title="Новый сотрудник" meta="Нужно назначить ставку"/>
                            </VStack>
                        </GridItem>

                        <GridItem bg={PALETTE.surface} border="1px solid" borderColor={PALETTE.border} borderRadius="12px" p={5}>
                            <Heading fontSize="lg">Быстрые действия</Heading>
                            <VStack mt={4} align="stretch" gap={2}>
                                <QuickAction icon={CalendarDays} label="Открыть период"/>
                                <QuickAction icon={Users} label="Добавить сотрудника"/>
                                <QuickAction icon={Download} label="Скачать отчёт"/>
                            </VStack>
                        </GridItem>
                    </Grid>
                </Box>
            </GridItem>
        </Grid>
    );
}

function VariantC() {
    return (
        <Box minH="100dvh" pb={28} bg={`linear-gradient(145deg, #15130f 0%, #0e0e0d 46%, #0a0b0a 100%)`}>
            <Container maxW="1280px" px={{base: 5, md: 10}}>
                <Flex as="header" h="84px" align="center" justify="space-between" borderBottom="1px solid" borderColor={PALETTE.border}>
                    <HStack gap={3}><Box w="10px" h="10px" bg={PALETTE.teal} borderRadius="2px" transform="rotate(45deg)" boxShadow={`0 0 18px ${PALETTE.teal}`}/><Text fontWeight="800" letterSpacing="-.04em">WageApp</Text><Text color={PALETTE.quiet} display={{base: "none", md: "block"}}>/ Ведомость</Text></HStack>
                    <HStack><PrototypeMark/><Button variant="ghost" color={PALETTE.muted} borderRadius="8px">Анна К. <ChevronDown size={15}/></Button></HStack>
                </Flex>

                <Grid templateColumns={{base: "1fr", lg: "minmax(0, .86fr) minmax(0, 1.14fr)"}} gap={{base: 10, lg: 16}} pt={{base: 9, md: 14}}>
                    <GridItem>
                        <Text color={PALETTE.teal} fontSize="xs" fontWeight="800" letterSpacing=".14em">ВЕДОМОСТЬ · 01—15 АВГУСТА</Text>
                        <Heading mt={5} fontSize={{base: "46px", md: "64px", xl: "76px"}} lineHeight=".98" letterSpacing="-.065em" maxW="650px">Спокойный контроль выплат.</Heading>
                        <Text mt={6} color={PALETTE.muted} fontSize={{base: "md", md: "lg"}} lineHeight="1.7" maxW="500px">Период почти готов к закрытию. Проверьте два отклонения — остальное уже рассчитано.</Text>

                        <Box mt={{base: 9, md: 14}} pb={7} borderBottom="1px solid" borderColor={PALETTE.borderStrong}>
                            <Text color={PALETTE.quiet} fontSize="xs" fontWeight="700" letterSpacing=".08em">ИТОГО К ВЫПЛАТЕ</Text>
                            <Text mt={3} fontSize={{base: "42px", md: "58px"}} fontWeight="750" letterSpacing="-.055em">1 284 600 ₽</Text>
                            <HStack mt={3} color={PALETTE.green}><ArrowUpRight size={16}/><Text fontWeight="700">6.8%</Text><Text color={PALETTE.quiet}>к прошлому периоду</Text></HStack>
                        </Box>

                        <SimpleGrid columns={3} gap={4} py={7} borderBottom="1px solid" borderColor={PALETTE.borderStrong}>
                            <EditorialMetric value="42" label="сотрудника"/>
                            <EditorialMetric value="186" label="смен"/>
                            <EditorialMetric value="1 846" label="часов"/>
                        </SimpleGrid>

                        <HStack mt={7} gap={3} align="stretch">
                            <Box flex={1}><TealButton><Check size={17}/> Подтвердить период</TealButton></Box>
                            <IconButton aria-label="Скачать ведомость" variant="outline" borderColor={PALETTE.borderStrong} borderRadius="8px"><Download size={18}/></IconButton>
                        </HStack>
                    </GridItem>

                    <GridItem>
                        <Flex justify="space-between" align="end" mb={5}><Box><Text color={PALETTE.quiet} fontSize="xs" letterSpacing=".1em" fontWeight="700">СОТРУДНИКИ</Text><Heading mt={1} fontSize="2xl" letterSpacing="-.04em">Последняя проверка</Heading></Box><Text color={PALETTE.muted} fontSize="sm">5 из 42</Text></Flex>
                        <VStack align="stretch" gap={0} borderTop="1px solid" borderColor={PALETTE.borderStrong}>
                            {employees.map((employee, index) => (
                                <Grid key={employee.name} templateColumns={{base: "1fr auto", sm: "1fr 90px 120px"}} gap={4} alignItems="center" py={5} borderBottom="1px solid" borderColor={PALETTE.border} position="relative" _hover={{"& .employee-index": {color: PALETTE.teal}, "& .employee-name": {transform: "translateX(3px)"}}}>
                                    <HStack gap={4} minW={0}><Text className="employee-index" color={PALETTE.quiet} fontSize="xs" transition="color 140ms">0{index + 1}</Text><Box minW={0} className="employee-name" transition="transform 140ms"><Text fontWeight="750" truncate>{employee.name}</Text><Text color={PALETTE.quiet} fontSize="sm">{employee.role} · {employee.hours}</Text></Box></HStack>
                                    <Text color={employee.delta.startsWith("−") ? PALETTE.red : PALETTE.green} fontSize="sm" fontWeight="700" display={{base: "none", sm: "block"}}>{employee.delta}</Text>
                                    <Box textAlign="right"><Text fontWeight="800">{employee.payout}</Text><Box mt={1}><StatusBadge status={employee.status}/></Box></Box>
                                </Grid>
                            ))}
                        </VStack>
                        <Flex mt={6} justify="space-between" align="center"><Text color={PALETTE.quiet} fontSize="sm">Показаны записи с последними изменениями</Text><Button variant="ghost" color={PALETTE.teal} borderRadius="8px">Все сотрудники <ArrowUpRight size={16}/></Button></Flex>

                        <Box mt={10} bg="linear-gradient(115deg, rgba(50,245,210,.10), rgba(50,245,210,.025))" border="1px solid" borderColor={PALETTE.tealBorder} borderRadius="12px" p={5} position="relative" overflow="hidden">
                            <Box position="absolute" right="-40px" top="-50px" w="150px" h="150px" bg={PALETTE.teal} opacity=".08" filter="blur(38px)"/>
                            <HStack align="start" gap={4}><Flex w="38px" h="38px" flex="0 0 auto" borderRadius="9px" bg={PALETTE.tealSoft} color={PALETTE.teal} align="center" justify="center"><Sparkles size={18}/></Flex><Box><Text fontWeight="750">Два значения отличаются от прогноза</Text><Text mt={1} color={PALETTE.muted} fontSize="sm" lineHeight="1.6">Отклонения отмечены цветом и не блокируют остальные выплаты.</Text></Box></HStack>
                        </Box>
                    </GridItem>
                </Grid>
            </Container>
        </Box>
    );
}

function StatusBadge({status}: {status: string}) {
    const style = status === "Готово"
        ? {color: PALETTE.green, bg: "rgba(93,211,158,.09)"}
        : status === "Проверить"
            ? {color: PALETTE.amber, bg: "rgba(229,181,103,.09)"}
            : {color: PALETTE.blue, bg: "rgba(117,167,255,.09)"};
    return <Badge {...style} borderRadius="full" px={2} py={0.5} fontSize="10px">{status}</Badge>;
}

function CheckItem({done = false, label, detail}: {done?: boolean; label: string; detail: string}) {
    return (
        <HStack align="start" gap={3}>
            <Flex mt="2px" w="20px" h="20px" flex="0 0 auto" borderRadius="6px" align="center" justify="center" bg={done ? PALETTE.tealSoft : "rgba(229,181,103,.10)"} color={done ? PALETTE.teal : PALETTE.amber} border="1px solid" borderColor={done ? PALETTE.tealBorder : "rgba(229,181,103,.24)"}>{done ? <Check size={13}/> : <Clock3 size={12}/>}</Flex>
            <Box><Text fontSize="sm" fontWeight="700">{label}</Text><Text color={PALETTE.quiet} fontSize="xs">{detail}</Text></Box>
        </HStack>
    );
}

function EarningsChart() {
    return (
        <Box mt={7} h="145px" position="relative">
            <svg viewBox="0 0 640 150" width="100%" height="100%" preserveAspectRatio="none" aria-label="График выплат за 14 дней" role="img">
                <defs>
                    <linearGradient id="teal-fill" x1="0" y1="0" x2="0" y2="1"><stop offset="0%" stopColor={PALETTE.teal} stopOpacity=".28"/><stop offset="100%" stopColor={PALETTE.teal} stopOpacity="0"/></linearGradient>
                    <filter id="teal-glow"><feGaussianBlur stdDeviation="3" result="blur"/><feMerge><feMergeNode in="blur"/><feMergeNode in="SourceGraphic"/></feMerge></filter>
                </defs>
                {[25, 65, 105, 145].map((y) => <line key={y} x1="0" y1={y} x2="640" y2={y} stroke="rgba(244,240,232,.07)" strokeWidth="1"/>)}
                <path d="M0 130 C55 118, 80 126, 120 100 S195 78, 235 88 S310 116, 350 73 S430 52, 470 63 S550 28, 640 18 L640 150 L0 150 Z" fill="url(#teal-fill)"/>
                <path d="M0 130 C55 118, 80 126, 120 100 S195 78, 235 88 S310 116, 350 73 S430 52, 470 63 S550 28, 640 18" fill="none" stroke={PALETTE.teal} strokeWidth="2.5" filter="url(#teal-glow)"/>
                <path d="M0 138 C70 130, 100 136, 150 119 S230 104, 280 110 S355 91, 405 99 S510 73, 640 67" fill="none" stroke={PALETTE.violet} strokeWidth="2" strokeDasharray="5 6" opacity=".75"/>
            </svg>
        </Box>
    );
}

function Legend({color, label}: {color: string; label: string}) {
    return <HStack gap={2}><Box w="7px" h="7px" bg={color} borderRadius="full"/><Text color={PALETTE.muted} fontSize="xs">{label}</Text></HStack>;
}

function MiniStat({value, label}: {value: string; label: string}) {
    return <Box bg="rgba(244,240,232,.025)" border="1px solid" borderColor={PALETTE.border} borderRadius="8px" p={3}><Text fontWeight="800">{value}</Text><Text color={PALETTE.quiet} fontSize="xs">{label}</Text></Box>;
}

function AlertRow({color, title, meta}: {color: string; title: string; meta: string}) {
    return <Flex gap={3} p={3} borderRadius="8px" _hover={{bg: "rgba(244,240,232,.025)"}}><Box mt="7px" w="7px" h="7px" flex="0 0 auto" bg={color} borderRadius="full"/><Box><Text fontSize="sm" fontWeight="700">{title}</Text><Text color={PALETTE.quiet} fontSize="xs">{meta}</Text></Box></Flex>;
}

function QuickAction({icon: Icon, label}: {icon: React.ComponentType<{size?: number}>; label: string}) {
    return <Button justifyContent="flex-start" variant="ghost" border="1px solid" borderColor={PALETTE.border} borderRadius="8px" color={PALETTE.muted} _hover={{bg: PALETTE.tealSoft, color: PALETTE.teal, borderColor: PALETTE.tealBorder}}><Icon size={17}/>{label}</Button>;
}

function EditorialMetric({value, label}: {value: string; label: string}) {
    return <Box><Text fontSize={{base: "xl", md: "2xl"}} fontWeight="800" letterSpacing="-.04em">{value}</Text><Text color={PALETTE.quiet} fontSize="xs">{label}</Text></Box>;
}
