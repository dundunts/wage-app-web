import { Heading, Stack, Text } from "@chakra-ui/react";

interface EmptyStateProps {
    title: string;
    description?: string;
}

export function EmptyState({ title, description }: EmptyStateProps) {
    return (
        <Stack
            layerStyle="panel"
            p={{base: 6, md: 8}}
            align="center"
            textAlign="center"
        >
            <Heading as="h2" size="sm" color="fg">{title}</Heading>
            {description && <Text fontSize="sm" color="fg.muted">{description}</Text>}
        </Stack>
    );
}
