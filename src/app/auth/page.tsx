// @/app/auth/page.tsx
"use client";

import React, {Suspense, useState} from "react";
import {Box, Button, Card, Center, Container, Heading, Input, Stack, Text, VStack,} from "@chakra-ui/react";
import {Field} from "@/components/ui/field";
import {Controller, useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter, useSearchParams} from "next/navigation";
import {authService} from "@/service/auth.service";
import {feedback} from "@/feedback/feedback";
import {loginSchema, LoginSchemaType} from "@/schemas/auth.schema";
import {Checkbox} from "@/components/ui/checkbox";
import {feedbackMessages} from "@/feedback/messages";

// Обертка для Suspense, так как useSearchParams требует этого в Next.js
function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirectUrl") || "/";

    const [isLoading, setIsLoading] = useState(false);

    const {
        control,
        register,
        handleSubmit,
        formState: {errors},
    } = useForm<LoginSchemaType>({
        resolver: zodResolver(loginSchema),
        defaultValues: {
            username: "",
            password: "",
            rememberMe: false,
        },
    });

    const onSubmit = async (data: LoginSchemaType) => {
        if (isLoading) return;

        setIsLoading(true);
        const loginFeedback = feedback.beginAction("login");

        try {
            await authService.login(data.username, data.password, data.rememberMe);
            loginFeedback.success();
            router.push(redirectUrl);
            router.refresh();
        } catch (error) {
            loginFeedback.error(error);
        } finally {
            setIsLoading(false);
        }
    };

    return (
        <Card.Root
            w="full"
            maxW="md"
            variant="outline"
        >
            <Card.Body p={{base: 6, md: 8}}>
                <VStack gap={6} align="stretch">
                    <Box textAlign="center">
                        <Text
                            color="accent"
                            fontSize="xs"
                            fontWeight="800"
                            letterSpacing="0.12em"
                            textTransform="uppercase"
                        >
                            Wage App
                        </Text>
                        <Heading
                            as="h1"
                            mt={2}
                            fontSize={{base: "2xl", md: "3xl"}}
                            lineHeight="1.1"
                        >
                            Вход в систему
                        </Heading>
                        <Text mt={3} color="fg.muted" fontSize="sm">
                            Введите данные учётной записи
                        </Text>
                    </Box>

                    <form onSubmit={handleSubmit(onSubmit)}>
                        <Stack gap={4}>
                            <Field
                                label="Пользователь"
                                invalid={!!errors.username}
                                errorText={errors.username?.message}
                            >
                                <Input
                                    {...register("username")}
                                    placeholder="Email или username"
                                    autoComplete="username"
                                    size="lg"
                                />
                            </Field>

                            <Field
                                label="Пароль"
                                invalid={!!errors.password}
                                errorText={errors.password?.message}
                            >
                                <Input
                                    type="password"
                                    {...register("password")}
                                    placeholder="Ваш пароль"
                                    autoComplete="current-password"
                                    size="lg"
                                />
                            </Field>

                            <Controller
                                control={control}
                                name="rememberMe"
                                render={({field}) => (
                                    <Checkbox
                                        checked={field.value}
                                        onCheckedChange={(event) => field.onChange(!!event.checked)}
                                        colorPalette="brand"
                                    >
                                        Запомнить меня
                                    </Checkbox>
                                )}
                            />

                            <Button
                                type="submit"
                                colorPalette="brand"
                                size="lg"
                                loading={isLoading}
                                loadingText={feedbackMessages.login.loading}
                                disabled={isLoading}
                                mt={4}
                            >
                                Войти
                            </Button>
                        </Stack>
                    </form>
                </VStack>
            </Card.Body>
        </Card.Root>
    );
}

export default function AuthPage() {
    return (
        <Box
            minH="100dvh"
            bg="bg.canvasWarm"
            bgImage="radial-gradient(circle at 50% 8%, {colors.accent.glow}, transparent 36%)"
        >
            <Container
                minH="100dvh"
                display="flex"
                alignItems="center"
                justifyContent="center"
                px={{base: 4, md: 6}}
                py={{base: 8, md: 12}}
            >
                <Suspense fallback={<Center>Загрузка формы...</Center>}>
                    <LoginForm/>
                </Suspense>
            </Container>
        </Box>
    );
}
