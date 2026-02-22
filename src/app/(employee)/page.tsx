'use client';

import {Badge, Box, Button, Container, Flex, Heading, VStack, Text} from "@chakra-ui/react";

export default function Home() {
    return (
        <Flex
            mt={10}
            color="gray.100"
            align="center"
            justify="center"
            px={4}
        >
            <Container maxW="3xl">
                <VStack gap={8} textAlign="center">
                    <Badge
                        colorPalette="purple"
                        variant="solid"
                        px={4}
                        py={2}
                        borderRadius="full"
                        fontSize="sm"
                    >
                        Релиз HuiMonet v2 - WageApp 🚀
                    </Badge>

                    <Heading
                        size="2xl"
                        fontWeight="extrabold"
                    >
                        Дорогие друзья,
                    </Heading>
                    <Heading
                        size="xl"
                        fontWeight="extrabold"
                    >
                        Уважаемые коллеги,
                    </Heading>
                    <Heading
                        size="md"
                        fontWeight="extrabold"
                    >
                        Дамы и господа,
                    </Heading>
                    <Heading
                        size="xs"
                        fontWeight="extrabold"
                    >
                        Или просто дешевки
                    </Heading>

                    <Text fontSize="xl" color="gray.300">
                        Это главная страница, но тут ничего нет.
                    </Text>

                    <Text fontSize="lg" color="gray.400">
                        Это не лень. Это <b>концепция</b>.
                    </Text>

                    <Box
                        p={6}
                        bg="gray.800"
                        borderRadius="2xl"
                        boxShadow="xl"
                        border="1px solid"
                        borderColor="gray.700"
                    >
                        <Text fontSize="md" color="gray.300">
                            Здесь может быть то, что придумаете
                        </Text>
                    </Box>

                    <Text fontSize="xs" color="gray.600">
                        Версия 0.0.0 — других не будет.
                    </Text>
                </VStack>
            </Container>
        </Flex>
    );
}