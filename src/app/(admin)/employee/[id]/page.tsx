// @/app/(admin)/employee/[id]/page.tsx
"use client";

import { useEffect, useState, use } from "react";
import { useRouter } from "next/navigation";
import {
    Box,
    Heading,
    Button,
    Flex,
    Stack,
    Text,
    Badge,
    Grid,
    Spinner,
    Center,
    Breadcrumb, Separator,
} from "@chakra-ui/react";
import {
    ArrowLeft,
    Pencil,
    Trash2,
    User,
    Building2,
    ChevronRight,
} from "lucide-react";

import { getEmployee, deleteEmployee } from "@/service/employee/employee.service";
import { useAllCompanies } from "@/hooks/use-all-companies";
import { Employee, EmployeePosition } from "@/types/employee.types";
import { DeleteConfirmModal } from "@/components/dialog/delete-confirm-modal";
import {toaster} from "@/components/ui/toaster";
import {EmployeeModal} from "@/components/dialog/employee-modal";

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

    const fetchEmployeeData = async () => {
        try {
            setIsLoading(true);
            const data = await getEmployee(id);
            setEmployee(data);
        } catch (error) {
            console.error(error);
            toaster.create({
                title: "Ошибка",
                description: "Не удалось загрузить данные сотрудника",
                type: "error",
            });
            router.push("/employee");
        } finally {
            setIsLoading(false);
        }
    };

    useEffect(() => {
        fetchEmployeeData();
    }, [id]);

    const handleDelete = async () => {
        try {
            setIsDeleting(true);
            await deleteEmployee(id);
            toaster.create({
                title: "Сотрудник удалён",
                type: "success",
            });
            router.push("/employee");
        } catch {
            toaster.create({
                title: "Ошибка",
                description: "Не удалось удалить сотрудника",
                type: "error",
            });
        } finally {
            setIsDeleting(false);
        }
    };

    if (isLoading) {
        return (
            <Center minH="400px">
                <Spinner size="lg" />
            </Center>
        );
    }

    if (!employee) return null;

    const assignedCompanies = companies.filter((c) =>
        employee.companyIds.includes(c.id)
    );

    return (
        <Box p={6} maxW="1000px" mx="auto">
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
            <Flex justify="space-between" align="flex-start" mb={8}>
                <Flex gap={4} align="center">
                    <Button
                        variant="ghost"
                        onClick={() => router.push("/employee")}
                        px={2}
                    >
                        <ArrowLeft size={20} />
                    </Button>

                    <Stack gap={1}>
                        <Heading size="lg">
                            {employee.lastName} {employee.firstName}{" "}
                            {employee.patronymic}
                        </Heading>
                        <Badge
                            colorPalette={
                                employee.position === EmployeePosition.MANAGER
                                    ? "purple"
                                    : "blue"
                            }
                            alignSelf="flex-start"
                        >
                            {employee.position}
                        </Badge>
                    </Stack>
                </Flex>

                <Flex gap={3}>
                    <Button
                        onClick={() => setEditOpen(true)}
                    >
                        <Pencil size={18} /> Изменить
                    </Button>
                    <Button
                        variant="outline"
                        colorPalette="red"
                        onClick={() => setDeleteOpen(true)}
                    >
                        <Trash2 size={18} /> Удалить
                    </Button>
                </Flex>
            </Flex>

            <Grid templateColumns={{ base: "1fr", md: "2fr 1fr" }} gap={8}>
                {/* Main info */}
                <Box
                    borderWidth="1px"
                    borderRadius="xl"
                    p={6}
                    bg="bg.panel"
                    shadow="sm"
                >
                    <Heading size="sm" mb={6} display="flex" alignItems="center">
                        <User size={18} style={{ marginRight: 8 }} />
                        Основная информация
                    </Heading>

                    <Stack gap={6}>
                        <Grid templateColumns="repeat(2, 1fr)" gap={4}>
                            <Box>
                                <Text fontSize="xs" color="fg.muted" fontWeight="bold">
                                    USER ID
                                </Text>
                                <Text fontWeight="medium">
                                    {employee.userId || "—"}
                                </Text>
                            </Box>
                            <Box>
                                <Text fontSize="xs" color="fg.muted" fontWeight="bold">
                                    SIMPLE NAME
                                </Text>
                                <Text fontWeight="medium">
                                    {employee.simpleName || "—"}
                                </Text>
                            </Box>
                        </Grid>

                        <Separator />

                        <Box>
                            <Text
                                fontSize="xs"
                                color="fg.muted"
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
                                            colorPalette="gray"
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
                                <Text fontSize="sm" color="orange.500">
                                    Компании не привязаны
                                </Text>
                            )}
                        </Box>
                    </Stack>
                </Box>

                {/* Sidebar */}
                <Box
                    borderWidth="1px"
                    borderRadius="xl"
                    p={6}
                    bg="blue.50"
                    borderColor="blue.100"
                >
                    <Text fontWeight="bold" color="blue.700" mb={2}>
                        Статус аккаунта
                    </Text>
                    <Text fontSize="sm" color="blue.600">
                        Сотрудник имеет доступ к системе в соответствии с ролью:
                        <strong> {employee.position}</strong>
                    </Text>
                </Box>
            </Grid>

            {/* Dialogs */}
            <EmployeeModal
                isOpen={isEditOpen}
                onClose={() => setEditOpen(false)}
                initialData={employee}
                onSuccess={fetchEmployeeData}
            />

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={handleDelete}
                isLoading={isDeleting}
                title="Удаление сотрудника"
                description={`Вы действительно хотите удалить сотрудника ${employee.lastName}?`}
            />
        </Box>
    );
}
