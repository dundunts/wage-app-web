import { Heading, Stack } from "@chakra-ui/react";
import { ReactNode } from "react";

interface PageHeaderProps {
    title: string;
    description?: ReactNode;
}

export function PageHeader({ title, description }: PageHeaderProps) {
    return (
        <Stack gap={2}>
            <Heading size="lg">{title}</Heading>
            {description}
        </Stack>
    );
}
