import { Stack, Text } from "@chakra-ui/react";

interface EmptyStateProps {
    title: string;
    description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
    return (
        <Stack
            borderWidth="1px"
            borderRadius="md"
            p={6}
            align="center"
            color="gray.500"
        >
            <Text fontWeight="medium">{title}</Text>
            {description && <Text fontSize="sm">{description}</Text>}
        </Stack>
    );
}
