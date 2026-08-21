// @/app/results/[id]/page.tsx
"use client";

import {use, useEffect, useRef, useState} from "react";
import {useRouter} from "next/navigation";
import {
    Badge,
    Box,
    Button,
    Card,
    Container,
    Flex,
    Grid,
    Heading,
    Separator,
    Spinner,
    Stack,
    Text
} from "@chakra-ui/react";
import {shiftResultService} from "@/service/results/shiftResult.service";
import {ShiftResultDetailed} from "@/types/shiftResult.types";
import {companyService} from "@/service/company/company.service";
import {Company} from "@/types/company.types";
import {toaster} from "@/components/ui/toaster";
import {ConfirmationDialog} from "@/components/dialog/ConfirmationDialog";
import {feedback} from "@/feedback/feedback";

// В Next.js 16 params - это Promise
export default function ResultDetailsPage({ params }: { params: Promise<{ id: string }> }) {
    // Разворачиваем параметры через хук use() (React 19 фича)
    const { id } = use(params);

    const router = useRouter();
    const [data, setData] = useState<ShiftResultDetailed | null>(null);
    const [companies, setCompanies] = useState<Company[]>([]);
    const [isLoading, setIsLoading] = useState(true);
    const [isDeleteDialogOpen, setDeleteDialogOpen] = useState(false);
    const [isDeletePending, setDeletePending] = useState(false);
    const deleteTriggerRef = useRef<HTMLButtonElement>(null);

    // Состояния модалок
    const [isEditModalOpen, setIsEditModalOpen] = useState(false);

    useEffect(() => {
        const fetchData = async () => {
            try {
                const [resultRes, companiesRes] = await Promise.all([
                    shiftResultService.getDetailed(id),
                    // getUserCompanies()
                    companyService.getForUser()
                ]);
                setData(resultRes.shiftResult);
                setCompanies(companiesRes);
            } catch (e) {
                toaster.create({ title: "Ошибка загрузки", type: "error" });
            } finally {
                setIsLoading(false);
            }
        };
        fetchData();
    }, [id]);

    const handleDelete = async () => {
        if (isDeletePending) return;

        const actionFeedback = feedback.beginAction("shiftResultDelete");
        setDeletePending(true);
        try {
            await shiftResultService.delete(id);
            actionFeedback.success();
            setDeleteDialogOpen(false);
            router.push("/results");
        } catch(error) {
            actionFeedback.error(error);
        } finally {
            setDeletePending(false);
        }
    };

    const handleEditSuccess = () => {
        // Перезагрузка данных страницы
        setIsLoading(true);
        shiftResultService.getDetailed(id)
            .then(res => setData(res.shiftResult))
            .finally(() => setIsLoading(false));
    };

    if (isLoading) return <Flex justify="center" p={20}><Spinner size="xl" /></Flex>;
    if (!data) return <Box p={10}>Данные не найдены</Box>;

    return (
        <Container maxW="4xl" py={8}>
            <Flex justify="space-between" align="center" mb={6}>
                <Box>
                    <Button variant="subtle" size="sm" mb={2} onClick={() => router.push("/results")}>
                        ← Назад к списку
                    </Button>
                    <Heading size="xl">
                        Смена от {new Date(data.date).toLocaleDateString("ru-RU")}
                    </Heading>
                </Box>
                <Flex gap={3}>
                    <Button variant="outline" onClick={() => setIsEditModalOpen(true)}>
                        Изменить
                    </Button>
                    <Button
                        ref={deleteTriggerRef}
                        colorPalette="red"
                        variant="solid"
                        onClick={() => setDeleteDialogOpen(true)}
                    >
                        Удалить
                    </Button>
                </Flex>
            </Flex>

            <Card.Root>
                <Card.Body>
                    <Stack gap={6} separator={<Separator />}>
                        <Box>
                            <Text color="gray.500" fontSize="sm">Источник расчета</Text>
                            <Badge mt={1} size="lg" variant="surface">
                                {data.calculationSource}
                            </Badge>
                        </Box>

                        <Box>
                            <Heading size="md" mb={4}>Детализация выплат</Heading>
                            <Stack gap={4}>
                                {data.payments.map((p) => (
                                    <Box key={p.id} p={4} borderWidth="1px" borderRadius="md">
                                        <Flex justify="space-between" mb={2}>
                                            <Text fontWeight="bold" fontSize="lg">
                                                {p.employee.lastName} {p.employee.firstName}
                                            </Text>
                                            <Text fontWeight="bold" color="green.600">
                                                Всего: {(p.percentFromRevenue + p.tips).toFixed(2)}
                                            </Text>
                                        </Flex>
                                        <Grid templateColumns="repeat(3, 1fr)" gap={4} fontSize="sm">
                                            <Box>
                                                <Text color="gray.500">Выручка (%)</Text>
                                                <Text>{p.percentFromRevenue}</Text>
                                            </Box>
                                            <Box>
                                                <Text color="gray.500">Чаевые</Text>
                                                <Text>{p.tips}</Text>
                                            </Box>
                                            <Box>
                                                <Text color="gray.500">Отработано</Text>
                                                <Text>{(p.workSeconds / 3600).toFixed(1)} ч.</Text>
                                            </Box>
                                        </Grid>
                                    </Box>
                                ))}
                            </Stack>
                        </Box>
                    </Stack>
                </Card.Body>
            </Card.Root>

            <ConfirmationDialog
                open={isDeleteDialogOpen}
                title="Удалить результат смены?"
                description="Результат смены будет удалён без возможности восстановления."
                confirmLabel="Удалить"
                cancelLabel="Отмена"
                pendingLabel="Результат смены удаляется"
                severity="danger"
                pending={isDeletePending}
                finalFocusEl={() => deleteTriggerRef.current}
                onCancel={() => {
                    if (!isDeletePending) {
                        setDeleteDialogOpen(false);
                    }
                }}
                onConfirm={handleDelete}
            />

            {/* Модальное окно редактирования */}
            {/*{isEditModalOpen && (*/}
            {/*    <ShiftResultModal*/}
            {/*        isOpen={isEditModalOpen}*/}
            {/*        onClose={() => setIsEditModalOpen(false)}*/}
            {/*        onSuccess={handleEditSuccess}*/}
            {/*        companies={companies}*/}
            {/*        initialData={data} // Передаем данные для заполнения*/}
            {/*    />*/}
            {/*)}*/}
        </Container>
    );
}
