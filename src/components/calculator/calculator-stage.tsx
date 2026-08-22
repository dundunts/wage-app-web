import {
    Box,
    Container,
    Flex,
    Grid,
    Heading,
    Stack,
    Text,
} from "@chakra-ui/react";
import {Check} from "lucide-react";
import {Fragment, type ComponentProps, type ReactNode} from "react";

export type CalculatorStage = 1 | 2 | 3;

const calculatorStages: ReadonlyArray<{label: string}> = [
    {label: "Сессия"},
    {label: "Checkpoint"},
    {label: "Расчёт"},
];

type CalculatorStageContainerProps = ComponentProps<typeof Container>;

export function CalculatorStageContainer(props: CalculatorStageContainerProps) {
    return (
        <Container
            maxW="5xl"
            px={{base: 4, md: 6}}
            py={{base: 6, md: 8}}
            {...props}
        />
    );
}

interface CalculatorStageProgressProps {
    currentStage: CalculatorStage;
}

export function CalculatorStageProgress({currentStage}: CalculatorStageProgressProps) {
    return (
        <Grid
            as="ol"
            aria-label="Этапы расчёта смены"
            templateColumns="auto 1fr auto 1fr auto"
            alignItems="center"
            gap={{base: 2, sm: 3}}
            m={0}
            px={1}
            listStyleType="none"
        >
            {calculatorStages.map((stage, index) => {
                const stageNumber = (index + 1) as CalculatorStage;
                const isCurrent = stageNumber === currentStage;
                const isCompleted = stageNumber < currentStage;
                const status = isCurrent ? "текущий" : isCompleted ? "завершён" : "ожидает";

                return (
                    <Fragment key={stage.label}>
                        {index > 0 && (
                            <Box
                                aria-hidden="true"
                                h="1px"
                                backgroundImage={stageNumber <= currentStage
                                    ? "linear-gradient(90deg, {colors.accent.border}, {colors.accent})"
                                    : "linear-gradient(90deg, {colors.border}, {colors.border.muted})"}
                            />
                        )}
                        <Flex
                            as="li"
                            aria-current={isCurrent ? "step" : undefined}
                            aria-label={`${stageNumber}. ${stage.label}: ${status}`}
                            align="center"
                            gap={{base: 1, sm: 2}}
                            minW={0}
                            color={isCurrent ? "fg" : isCompleted ? "fg.muted" : "fg.quiet"}
                        >
                            <Flex
                                align="center"
                                justify="center"
                                flexShrink={0}
                                w={6}
                                h={6}
                                color={isCurrent || isCompleted ? "accent" : "fg.quiet"}
                                bg={isCurrent || isCompleted ? "accent.subtle" : "bg.panel"}
                                borderWidth="1px"
                                borderColor={isCurrent || isCompleted ? "accent.border" : "border"}
                                borderRadius="full"
                                boxShadow={isCurrent ? "accent" : "none"}
                                fontSize="xs"
                                fontWeight="bold"
                            >
                                {isCompleted ? <Check aria-hidden="true" size={13} /> : stageNumber}
                            </Flex>
                            <Text
                                as="span"
                                display={{base: "none", sm: "inline"}}
                                fontSize="sm"
                                fontWeight={isCurrent ? "semibold" : "medium"}
                                whiteSpace="nowrap"
                            >
                                {stage.label}
                            </Text>
                        </Flex>
                    </Fragment>
                );
            })}
        </Grid>
    );
}

interface CalculatorStageHeaderProps {
    currentStage: CalculatorStage;
    title: string;
    description: ReactNode;
}

export function CalculatorStageHeader({
    currentStage,
    title,
    description,
}: CalculatorStageHeaderProps) {
    return (
        <Stack as="header" gap={5} minW={0}>
            <Stack gap={2} minW={0}>
                <Text
                    color="accent"
                    fontSize="xs"
                    fontWeight="bold"
                    letterSpacing="wide"
                    textTransform="uppercase"
                >
                    Калькулятор смены · Этап {currentStage}
                </Text>
                <Heading
                    as="h1"
                    fontSize={{base: "2xl", md: "3xl"}}
                    lineHeight="1.15"
                    overflowWrap="anywhere"
                >
                    {title}
                </Heading>
                <Box color="fg.muted" fontSize="sm">
                    {description}
                </Box>
            </Stack>
            <CalculatorStageProgress currentStage={currentStage} />
        </Stack>
    );
}
