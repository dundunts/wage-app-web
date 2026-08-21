// @/app/(admin)/employee/[id]/page.tsx
"use client";

import {use, useCallback, useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {
    Badge,
    Box,
    Breadcrumb,
    Button,
    Card,
    Center,
    Flex,
    Grid,
    Heading,
    HStack,
    IconButton,
    Separator,
    Spinner,
    Stack,
    Text,
} from "@chakra-ui/react";
import {
    ArrowLeft,
    Building2,
    ChevronRight,
    Info,
    Pencil,
    Trash2,
    TriangleAlert,
    User,
} from "lucide-react";

import {employeeService} from "@/service/employee/employee.service";
import {useAllCompanies} from "@/hooks/useAllCompanies";
import {Employee} from "@/types/employee.types";
import {ConfirmationDialog} from "@/components/dialog/ConfirmationDialog";
import {EmployeeModal} from "@/components/dialog/employee-modal";
import {feedback} from "@/feedback/feedback";
import {feedbackMessages} from "@/feedback/messages";

interface Props {
    params: Promise<{ id: string }>;
}

export default function EmployeeDetailPage({ params }: Props) {
    const { id } = use(params);
    const router = useRouter();

    const [employee, setEmployee] = useState<Employee | null>(null);
    const [isLoading, setIsLoading] = useState(true);
    const { companies } = useAllCompanies();

    // Dialog states
    const [isEditOpen, setEditOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteTriggerRef = useRef<HTMLButtonElement>(null);

    const fetchEmployeeData = useCallback(async () => {
        try {
            setIsLoading(true);
            const data = await employeeService.getById(id);
            setEmployee(data);
        } catch (error) {
            feedback.beginAction("employeeDetailLoad").error(error);
            router.push("/employee");
        } finally {
            setIsLoading(false);
        }
    }, [id, router]);

    useEffect(() => {
        fetchEmployeeData();
    }, [fetchEmployeeData]);

    const handleDelete = async () => {
        if (isDeleting) return;

        const actionFeedback = feedback.beginAction("employeeDelete");
        try {
            setIsDeleting(true);
            await employeeService.delete(id);
            actionFeedback.success();
            setDeleteOpen(false);
            router.push("/employee");
        } catch (error) {
            actionFeedback.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <Center role="status" aria-label="Employee загружается" minH="400px">
                <Spinner size="lg" />
            </Center>
        );
    }

    if (!employee) return null;

    const assignedCompanies = companies.filter((c) =>
        employee.companyIds.includes(c.id)
    );
    const accountStatus = employee.userId
        ? {
            color: "status.info",
            icon: <Info size={18} aria-hidden="true"/>,
            title: "Аккаунт связан",
            description: "Для сотрудника указан User ID. Должность не определяет системные права.",
        }
        : {
            color: "status.warning",
            icon: <TriangleAlert size={18} aria-hidden="true"/>,
            title: "Аккаунт не связан",
            description: "User ID не указан. Сотрудник может учитываться без учётной записи.",
        };

    return (
        <Box p={{base: 4, md: 6}} maxW="1000px" mx="auto">
            {/* Breadcrumbs */}
            <Breadcrumb.Root mb={6}>
                <Breadcrumb.List>
                    <Breadcrumb.Item>
                        <Breadcrumb.Link onClick={() => router.push("/employee")}>
                            Работники
                        </Breadcrumb.Link>
                    </Breadcrumb.Item>
                    <Breadcrumb.Separator>
                        <ChevronRight size={14} />
                    </Breadcrumb.Separator>
                    <Breadcrumb.Item>
                        <Breadcrumb.CurrentLink>
                            {employee.lastName} {employee.firstName[0]}.
                        </Breadcrumb.CurrentLink>
                    </Breadcrumb.Item>
                </Breadcrumb.List>
            </Breadcrumb.Root>

            {/* Header */}
            <Flex
                justify="space-between"
                align={{base: "stretch", md: "flex-start"}}
                direction={{base: "column", md: "row"}}
                gap={5}
                mb={8}
            >
                <Flex gap={3} align="center" minW={0}>
                    <IconButton
                        aria-label="Вернуться к списку работников"
                        variant="ghost"
                        onClick={() => router.push("/employee")}
                    >
                        <ArrowLeft size={20} />
                    </IconButton>

                    <Stack gap={1} minW={0}>
                        <Text color="fg.quiet" fontSize="xs" fontWeight="bold" letterSpacing="0.08em">
                            КАРТОЧКА РАБОТНИКА
                        </Text>
                        <Heading size="lg">
                            {employee.lastName} {employee.firstName}{" "}
                            {employee.patronymic}
                        </Heading>
                        <Badge
                            alignSelf="flex-start"
                            variant="subtle"
                            color="status.info"
                            borderWidth="1px"
                            borderColor="border"
                        >
                            <User size={12} aria-hidden="true"/>
                            {employee.position}
                        </Badge>
                    </Stack>
                </Flex>

                <Flex gap={3} direction={{base: "column", sm: "row"}}>
                    <Button
                        colorPalette="brand"
                        onClick={() => setEditOpen(true)}
                    >
                        <Pencil size={18} /> Изменить
                    </Button>
                    <Button
                        ref={deleteTriggerRef}
                        variant="outline"
                        colorPalette="danger"
                        onClick={() => setDeleteOpen(true)}
                    >
                        <Trash2 size={18} /> Удалить
                    </Button>
                </Flex>
            </Flex>

            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={6}>
                <Card.Root>
                    <Card.Header pb={0}>
                        <Heading size="sm" display="flex" alignItems="center" gap={2}>
                            <User size={18} aria-hidden="true"/>
                            Основная информация
                        </Heading>
                    </Card.Header>
                    <Card.Body>
                        <Stack gap={6}>
                            <Grid templateColumns={{base: "1fr", sm: "repeat(2, 1fr)"}} gap={4}>
                                <Box>
                                    <Text fontSize="xs" color="fg.quiet" fontWeight="bold" letterSpacing="0.06em">
                                        USER ID
                                    </Text>
                                    <Text fontWeight="semibold" fontVariantNumeric="tabular-nums" overflowWrap="anywhere">
                                        {employee.userId || "—"}
                                    </Text>
                                </Box>
                                <Box>
                                    <Text fontSize="xs" color="fg.quiet" fontWeight="bold" letterSpacing="0.06em">
                                        SIMPLE NAME
                                    </Text>
                                    <Text fontWeight="semibold" color={employee.simpleName ? "fg" : "fg.muted"}>
                                        {employee.simpleName || "—"}
                                    </Text>
                                </Box>
                            </Grid>

                            <Separator />

                            <Box>
                            <Text
                                fontSize="xs"
                                color="fg.quiet"
                                fontWeight="bold"
                                mb={3}
                            >
                                ПРИВЯЗАННЫЕ КОМПАНИИ
                            </Text>

                            {assignedCompanies.length > 0 ? (
                                <Flex wrap="wrap" gap={2}>
                                    {assignedCompanies.map((company) => (
                                        <Badge
                                            key={company.id}
                                            variant="subtle"
                                            color="fg.muted"
                                            px={3}
                                            py={1}
                                            borderRadius="full"
                                        >
                                            <Flex align="center" gap={1}>
                                                <Building2 size={12} />
                                                {company.title}
                                            </Flex>
                                        </Badge>
                                    ))}
                                </Flex>
                            ) : (
                                <HStack color="status.warning" align="flex-start">
                                    <TriangleAlert size={16} aria-hidden="true"/>
                                    <Text fontSize="sm">Компании не привязаны</Text>
                                </HStack>
                            )}
                            </Box>
                        </Stack>
                    </Card.Body>
                </Card.Root>

                <Card.Root bg="bg.raised" alignSelf="start">
                    <Card.Body>
                        <HStack
                            color={accountStatus.color}
                            align="flex-start"
                            gap={3}
                            mb={3}
                        >
                            {accountStatus.icon}
                            <Text fontWeight="bold">{accountStatus.title}</Text>
                        </HStack>
                        <Text fontSize="sm" color="fg.muted">
                            {accountStatus.description}
                        </Text>
                    </Card.Body>
                </Card.Root>
            </Grid>

            {/* Dialogs */}
            <EmployeeModal
                isOpen={isEditOpen}
                onClose={() => setEditOpen(false)}
                initialData={employee}
                onSuccess={fetchEmployeeData}
            />

            <ConfirmationDialog
                open={isDeleteOpen}
                title="Удалить сотрудника?"
                description={`Сотрудник «${employee.lastName} ${employee.firstName} ${employee.patronymic}» будет удалён без возможности восстановления.`}
                confirmLabel="Удалить"
                cancelLabel="Отмена"
                pendingLabel={feedbackMessages.employeeDelete.loading}
                severity="danger"
                pending={isDeleting}
                finalFocusEl={() => deleteTriggerRef.current}
                onCancel={() => {
                    if (!isDeleting) {
                        setDeleteOpen(false);
                    }
                }}
                onConfirm={handleDelete}
            />
        </Box>
    );
}
