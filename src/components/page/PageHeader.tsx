import { Box, Flex, Heading, Stack } from "@chakra-ui/react";
import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    description?: ReactNode;
    actions?: ReactNode;
}

export function PageHeader({ title, description, actions }: PageHeaderProps) {
    return (
        <Flex
            as="header"
            direction={{base: "column", md: "row"}}
            align={{base: "stretch", md: "center"}}
            justify="space-between"
            gap={4}
            minW={0}
        >
            <Stack gap={2} minW={0}>
                <Heading
                    as="h1"
                    fontSize={{base: "2xl", md: "3xl"}}
                    lineHeight="1.15"
                    overflowWrap="anywhere"
                >
                    {title}
                </Heading>
                {description && (
                    <Box color="fg.muted" fontSize="sm">
                        {description}
                    </Box>
                )}
            </Stack>
            {actions && (
                <Box flexShrink={0} w={{base: "full", md: "auto"}}>
                    {actions}
                </Box>
            )}
        </Flex>
    );
}
