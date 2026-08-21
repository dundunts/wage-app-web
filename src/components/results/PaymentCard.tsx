import {Box, Flex, Grid, Text} from "@chakra-ui/react";
import {ShiftResultPayment} from "@/types/shiftResult.types";

const moneyFormatter = new Intl.NumberFormat("ru-RU", {
    style: "currency",
    currency: "RUB",
    minimumFractionDigits: 2,
    maximumFractionDigits: 2,
});

const hoursFormatter = new Intl.NumberFormat("ru-RU", {
    minimumFractionDigits: 1,
    maximumFractionDigits: 1,
});

export function PaymentCard({payment}: {payment: ShiftResultPayment}) {
    const employeeName = `${payment.employee.lastName} ${payment.employee.firstName}`;

    return (
        <Box
            as="article"
            aria-label={`Выплата: ${employeeName}`}
            p={{base: 4, md: 5}}
            bg="bg.raised"
            borderWidth="1px"
            borderColor="border"
            borderRadius="panel"
        >
            <Flex
                justify="space-between"
                align={{base: "start", sm: "center"}}
                direction={{base: "column", sm: "row"}}
                gap={2}
                mb={4}
            >
                <Text fontWeight="bold" fontSize="lg">{employeeName}</Text>
                <Text fontWeight="bold" fontVariantNumeric="tabular-nums">
                    Итого: {moneyFormatter.format(payment.percentFromRevenue + payment.tips)}
                </Text>
            </Flex>
            <Grid templateColumns={{base: "1fr", sm: "repeat(3, 1fr)"}} gap={4} fontSize="sm">
                <Box>
                    <Text color="fg.muted">От выручки</Text>
                    <Text fontVariantNumeric="tabular-nums">
                        {moneyFormatter.format(payment.percentFromRevenue)}
                    </Text>
                </Box>
                <Box>
                    <Text color="fg.muted">Чаевые</Text>
                    <Text fontVariantNumeric="tabular-nums">
                        {moneyFormatter.format(payment.tips)}
                    </Text>
                </Box>
                <Box>
                    <Text color="fg.muted">Отработано</Text>
                    <Text fontVariantNumeric="tabular-nums">
                        {hoursFormatter.format(payment.workSeconds / 3600)} ч
                    </Text>
                </Box>
            </Grid>
        </Box>
    );
}
