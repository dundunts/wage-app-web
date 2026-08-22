import type {ReactNode} from "react";
import {Stat} from "@chakra-ui/react";

interface StatisticSummaryCardProps {
    children: ReactNode;
    label: string;
}

export function StatisticSummaryCard({children, label}: StatisticSummaryCardProps) {
    return (
        <Stat.Root
            minW={0}
            borderWidth="1px"
            borderColor="border"
            borderRadius="panel"
            bg="bg.panel"
            p={4}
            fontFamily="body"
            fontVariantNumeric="tabular-nums"
        >
            <Stat.Label color="fg.muted" fontSize="sm">
                {label}
            </Stat.Label>
            <Stat.ValueText mt={1} color="fg" fontSize={{base: "lg", md: "xl"}}>
                {children}
            </Stat.ValueText>
        </Stat.Root>
    );
}
