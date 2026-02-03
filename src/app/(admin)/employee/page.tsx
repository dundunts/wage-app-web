// @/app/(admin)/employee/page.tsx
"use client";

import {useEffect, useState, useCallback, useMemo} from "react";
import {useRouter} from "next/navigation";
import {
    MoreVertical,
    Plus,
    Trash2,
    Eye,
    UserX,
} from "lucide-react";

import {DeleteConfirmModal} from "@/components/dialog/delete-confirm-modal";
import {useAllCompanies} from "@/hooks/use-all-companies";
import {
    getEmployeesByCompanies,
    deleteEmployee,
} from "@/service/employee/employee.service";
import {CompanyEmployeeInfo} from "@/types/employee.types";
import {toaster} from "@/components/ui/toaster";
import {EmployeeModal} from "@/components/dialog/employee-modal";
import {
    Box,
    Button,
    Center,
    createListCollection,
    Flex,
    Heading,
    Menu,
    Portal,
    Select,
    Spinner,
    Table,
    Text
} from "@chakra-ui/react";

export default function EmployeeListPage() {
    const router = useRouter();

    const {companies, isLoading: isCompaniesLoading} = useAllCompanies();
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [employees, setEmployees] = useState<CompanyEmployeeInfo[]>([]);
    const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);

    // Dialog state
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [isDeleteOpen, setDeleteOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<string | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);

    // Default company
    useEffect(() => {
        if (companies.length > 0 && !selectedCompanyId) {
            setSelectedCompanyId(companies[0].id);
        }
    }, [companies, selectedCompanyId]);

    const companiesCollection = useMemo(
        () => createListCollection({
            items: companies,
            itemToValue: c => c.id,
            itemToString: c => c.title
        }),
        [companies]
    )

    const fetchEmployees = useCallback(async () => {
        if (!selectedCompanyId) return;

        try {
            setIsEmployeesLoading(true);
            const response = await getEmployeesByCompanies([selectedCompanyId]);
            const companyData = response.find(
                (r) => r.companyId === selectedCompanyId
            );
            setEmployees(companyData?.data || []);
        } catch (e) {
            console.error(e);
            toaster.create({
                title: "Ошибка",
                description: "Не удалось загрузить список сотрудников",
                type: "error",
            });
        } finally {
            setIsEmployeesLoading(false);
        }
    }, [selectedCompanyId]);

    useEffect(() => {
        fetchEmployees();
    }, [fetchEmployees]);

    const formatShortName = (emp: CompanyEmployeeInfo) => {
        const f = emp.firstName?.[0] ? `${emp.firstName[0]}.` : "";
        const p = emp.patronymic?.[0] ? `${emp.patronymic[0]}.` : "";
        return `${emp.lastName} ${f} ${p}`;
    };

    const handleDeleteClick = (id: string) => {
        setEmployeeToDelete(id);
        setDeleteOpen(true);
    };

    const confirmDelete = async () => {
        if (!employeeToDelete) return;

        try {
            setIsDeleting(true);
            await deleteEmployee(employeeToDelete);
            toaster.create({
                title: "Сотрудник удалён",
                type: "success",
            });
            fetchEmployees();
            setDeleteOpen(false);
        } catch {
            toaster.create({
                title: "Ошибка",
                description: "Не удалось удалить сотрудника",
                type: "error",
            });
        } finally {
            setIsDeleting(false);
            setEmployeeToDelete(null);
        }
    };

    return (
        <Box p={6}>
            {/* Header */}
            <Flex justify="space-between" align="center" mb={6}>
                <Heading size="lg">Работники</Heading>
                <Button
                    colorPalette="blue"
                    onClick={() => setCreateOpen(true)}
                >
                    <Plus size={20}/> Создать работника
                </Button>
            </Flex>

            {/* Filter */}
            <Box maxW="400px" mb={6}>
                <Text mb={2} fontWeight="medium">
                    Компания
                </Text>
                <Select.Root
                    collection={companiesCollection}
                    value={[selectedCompanyId]}
                    disabled={isCompaniesLoading}
                    onValueChange={(e) => setSelectedCompanyId(e.value[0] || "")}
                    size="sm"
                    width="320px"
                >
                    <Select.HiddenSelect />
                    <Select.Label>Select company</Select.Label>
                    <Select.Control>
                        <Select.Trigger>
                            <Select.ValueText placeholder="Select company" />
                        </Select.Trigger>
                        <Select.IndicatorGroup>
                            <Select.Indicator />
                        </Select.IndicatorGroup>
                    </Select.Control>
                    <Portal>
                        <Select.Positioner>
                            <Select.Content>
                                {companiesCollection.items.map((company) => (
                                    <Select.Item item={company} key={company.id}>
                                        {company.title}
                                        <Select.ItemIndicator />
                                    </Select.Item>
                                ))}
                            </Select.Content>
                        </Select.Positioner>
                    </Portal>
                </Select.Root>
                {/*<Select*/}
                {/*    value={selectedCompanyId}*/}
                {/*    onChange={(e) => setSelectedCompanyId(e.target.value)}*/}
                {/*    disabled={isCompaniesLoading}*/}
                {/*>*/}
                {/*    {companies.map((company) => (*/}
                {/*        <option key={company.id} value={company.id}>*/}
                {/*            {company.title}*/}
                {/*        </option>*/}
                {/*    ))}*/}
                {/*</Select>*/}
            </Box>

            {/* Table */}
            <Box
                borderWidth="1px"
                borderRadius="lg"
                overflow="hidden"
                bg="bg.panel"
                shadow="sm"
            >
                {isEmployeesLoading ? (
                    <Center p={10}>
                        <Spinner size="lg"/>
                    </Center>
                ) : employees.length === 0 ? (
                    <Center p={10} flexDirection="column">
                        <UserX size={48}/>
                        <Text mt={4} color="fg.muted">
                            В этой компании пока нет сотрудников
                        </Text>
                    </Center>
                ) : (
                    <Table.Root>
                        <Table.Header bg="gray.50">
                            <Table.Row>
                                <Table.ColumnHeader>ФИО</Table.ColumnHeader>
                                <Table.ColumnHeader>Должность</Table.ColumnHeader>
                                <Table.ColumnHeader w="50px"/>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {employees.map((employee) => (
                                <Table.Row key={employee.id}>
                                    <Table.Cell fontWeight="medium">
                                        {formatShortName(employee)}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Text fontSize="sm" color="fg.muted">
                                            {employee.position}
                                        </Text>
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Menu.Root>
                                            <Menu.Trigger asChild>
                                                <Button variant="ghost" size="sm">
                                                    <MoreVertical size={16}/>
                                                </Button>
                                            </Menu.Trigger>

                                            <Menu.Content>
                                                <Menu.Item
                                                    value="details"
                                                    onClick={() =>
                                                        router.push(
                                                            `/employee/${employee.id}`
                                                        )
                                                    }
                                                >
                                                    <Eye size={16}/>
                                                    Подробнее
                                                </Menu.Item>
                                                <Menu.Item
                                                    value="delete"
                                                    color="red.500"
                                                    onClick={() =>
                                                        handleDeleteClick(employee.id)
                                                    }
                                                >
                                                    <Trash2 size={16}/>
                                                    Удалить
                                                </Menu.Item>
                                            </Menu.Content>
                                        </Menu.Root>
                                    </Table.Cell>
                                </Table.Row>
                            ))}
                        </Table.Body>
                    </Table.Root>
                )}
            </Box>

            {/* Dialogs */}
            <EmployeeModal
                isOpen={isCreateOpen}
                onClose={() => setCreateOpen(false)}
                onSuccess={fetchEmployees}
                initialData={null}
            />

            <DeleteConfirmModal
                isOpen={isDeleteOpen}
                onClose={() => setDeleteOpen(false)}
                onConfirm={confirmDelete}
                isLoading={isDeleting}
                title="Удаление работника"
                description="Вы уверены? Это действие нельзя отменить."
            />
        </Box>
    );
}
