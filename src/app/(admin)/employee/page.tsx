// @/app/(admin)/employee/page.tsx
"use client";

import {useCallback, useEffect, useMemo, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {Eye, MoreVertical, Plus, Trash2, UserX} from "lucide-react";

import {ConfirmationDialog} from "@/components/dialog/ConfirmationDialog";
import {useAllCompanies} from "@/hooks/useAllCompanies";
import {employeeService} from "@/service/employee/employee.service";
import {CompanyEmployeeInfo} from "@/types/employee.types";
import {EmployeeModal} from "@/components/dialog/employee-modal";
import {feedback} from "@/feedback/feedback";
import {feedbackMessages} from "@/feedback/messages";
import {
    Box,
    Button,
    Center,
    createListCollection,
    Flex,
    Heading,
    IconButton,
    Menu,
    Portal,
    Select,
    Spinner,
    Stack,
    Table,
    Text,
} from "@chakra-ui/react";

export default function EmployeeListPage() {
    const router = useRouter();

    const {companies, isLoading: isCompaniesLoading} = useAllCompanies();
    const [selectedCompanyId, setSelectedCompanyId] = useState("");
    const [employees, setEmployees] = useState<CompanyEmployeeInfo[]>([]);
    const [isEmployeesLoading, setIsEmployeesLoading] = useState(false);

    // Dialog state
    const [isCreateOpen, setCreateOpen] = useState(false);
    const [employeeToDelete, setEmployeeToDelete] = useState<CompanyEmployeeInfo | null>(null);
    const [isDeleting, setIsDeleting] = useState(false);
    const deleteTriggerRef = useRef<HTMLButtonElement | null>(null);

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
            const response = await employeeService.getByCompanies([selectedCompanyId]);
            const companyData = response.find(
                (r) => r.companyId === selectedCompanyId
            );
            setEmployees(companyData?.data || []);
        } catch (e) {
            feedback.beginAction("employeeListLoad").error(e);
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

    const confirmDelete = async () => {
        if (!employeeToDelete || isDeleting) return;

        const actionFeedback = feedback.beginAction("employeeDelete");
        try {
            setIsDeleting(true);
            await employeeService.delete(employeeToDelete.id);
            actionFeedback.success();
            fetchEmployees();
            setEmployeeToDelete(null);
        } catch (error) {
            actionFeedback.error(error);
        } finally {
            setIsDeleting(false);
        }
    };

    return (
        <Box p={{base: 4, md: 6}} maxW="7xl" mx="auto">
            <Flex
                justify="space-between"
                align={{base: "stretch", sm: "center"}}
                direction={{base: "column", sm: "row"}}
                gap={4}
                mb={6}
            >
                <Stack gap={1}>
                    <Text color="accent" fontSize="xs" fontWeight="bold" letterSpacing="0.1em">
                        УПРАВЛЕНИЕ КОМАНДОЙ
                    </Text>
                    <Heading as="h1" size="lg">Работники</Heading>
                    <Text color="fg.muted" fontSize="sm">
                        Состав выбранной компании и назначенные должности
                    </Text>
                </Stack>
                <Button
                    colorPalette="brand"
                    onClick={() => setCreateOpen(true)}
                    alignSelf={{base: "stretch", sm: "center"}}
                >
                    <Plus size={20}/> Создать работника
                </Button>
            </Flex>

            <Box maxW="400px" mb={6}>
                <Select.Root
                    collection={companiesCollection}
                    value={[selectedCompanyId]}
                    disabled={isCompaniesLoading}
                    onValueChange={(e) => setSelectedCompanyId(e.value[0] || "")}
                    size="sm"
                    width="full"
                >
                    <Select.HiddenSelect />
                    <Select.Label color="fg.muted">Компания</Select.Label>
                    <Select.Control>
                        <Select.Trigger>
                            <Select.ValueText placeholder="Выберите компанию" />
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
            </Box>

            <Box
                borderWidth="1px"
                borderColor="border"
                borderRadius="panel"
                overflowX="auto"
                bg="bg.panel"
                shadow="panel"
                role="region"
                aria-label="Список работников"
                tabIndex={employees.length > 0 ? 0 : undefined}
                _focusVisible={{outline: "2px solid", outlineColor: "focus.ring", outlineOffset: "2px"}}
            >
                {isEmployeesLoading ? (
                    <Center role="status" aria-label="Employee загружаются" p={10}>
                        <Spinner size="lg"/>
                    </Center>
                ) : employees.length === 0 ? (
                    <Center p={10} flexDirection="column">
                        <UserX size={48} aria-hidden="true"/>
                        <Text mt={4} color="fg.muted">
                            В этой компании пока нет сотрудников
                        </Text>
                    </Center>
                ) : (
                    <Table.Root size="sm" minW="560px" fontVariantNumeric="tabular-nums">
                        <Table.Header bg="bg.subtle">
                            <Table.Row borderColor="border">
                                <Table.ColumnHeader color="fg.quiet" letterSpacing="0.06em">
                                    ФИО
                                </Table.ColumnHeader>
                                <Table.ColumnHeader color="fg.quiet" letterSpacing="0.06em">
                                    Должность
                                </Table.ColumnHeader>
                                <Table.ColumnHeader w="56px" color="fg.quiet" aria-label="Действия"/>
                            </Table.Row>
                        </Table.Header>

                        <Table.Body>
                            {employees.map((employee) => (
                                <Table.Row
                                    key={employee.id}
                                    borderColor="border.muted"
                                    transitionProperty="background-color"
                                    transitionDuration="quiet"
                                    transitionTimingFunction="quiet"
                                    _hover={{bg: "accent.subtle"}}
                                    _motionReduce={{transitionDuration: "0ms"}}
                                >
                                    <Table.Cell fontWeight="medium">
                                        {formatShortName(employee)}
                                    </Table.Cell>
                                    <Table.Cell>
                                        <Text fontSize="sm" color="fg.muted">
                                            {employee.position}
                                        </Text>
                                    </Table.Cell>
                                    <Table.Cell textAlign="end">
                                        <Menu.Root>
                                            <Menu.Trigger asChild>
                                                <IconButton
                                                    variant="ghost"
                                                    size="sm"
                                                    aria-label={`Действия с работником ${formatShortName(employee)}`}
                                                    onFocus={(event) => {
                                                        deleteTriggerRef.current = event.currentTarget;
                                                    }}
                                                    onClick={(event) => {
                                                        deleteTriggerRef.current = event.currentTarget;
                                                    }}
                                                >
                                                    <MoreVertical size={16}/>
                                                </IconButton>
                                            </Menu.Trigger>
                                            <Portal>
                                                <Menu.Positioner>
                                                    <Menu.Content>
                                                        <Menu.Item
                                                            value="details"
                                                            onClick={() => router.push(`/employee/${employee.id}`)}
                                                        >
                                                            <Box color="accent">
                                                                <Eye size={16}/>
                                                            </Box>
                                                            Подробнее
                                                        </Menu.Item>
                                                        <Menu.Item
                                                            value="delete"
                                                            color="status.danger"
                                                            onClick={() => setEmployeeToDelete(employee)}
                                                        >
                                                            <Trash2 size={16}/>
                                                            Удалить
                                                        </Menu.Item>
                                                    </Menu.Content>
                                                </Menu.Positioner>
                                            </Portal>
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

            <ConfirmationDialog
                open={employeeToDelete !== null}
                title="Удалить сотрудника?"
                description={`Сотрудник «${employeeToDelete
                    ? `${employeeToDelete.lastName} ${employeeToDelete.firstName} ${employeeToDelete.patronymic}`
                    : ""}» будет удалён без возможности восстановления.`}
                confirmLabel="Удалить"
                cancelLabel="Отмена"
                pendingLabel={feedbackMessages.employeeDelete.loading}
                severity="danger"
                pending={isDeleting}
                finalFocusEl={() => deleteTriggerRef.current}
                onCancel={() => {
                    if (!isDeleting) {
                        setEmployeeToDelete(null);
                    }
                }}
                onConfirm={confirmDelete}
            />
        </Box>
    );
}
