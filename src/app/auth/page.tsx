// @/app/auth/page.tsx
"use client";

import React, {useState, useEffect, Suspense} from "react";
import {
    Box,
    Button,
    Container,
    Heading,
    Input,
    Stack,
    Text,
    Center,
    VStack,
} from "@chakra-ui/react";
import {Field} from "@/components/ui/field"; // * Примечание 1
import {PasswordInput} from "@/components/ui/password-input" // * Примечание 1 (или стандартный InputGroup)
import {useForm} from "react-hook-form";
import {zodResolver} from "@hookform/resolvers/zod";
import {useRouter, useSearchParams} from "next/navigation";
import {authService} from "@/service/auth.service";
import {Toaster, toaster} from "@/components/ui/toaster";
import {loginSchema, LoginSchemaType} from "@/schemas/auth.schema";
import {Checkbox} from "@/components/ui/checkbox"; // Chakra v3 Toaster

// Обертка для Suspense, так как useSearchParams требует этого в Next.js
function LoginForm() {
    const router = useRouter();
    const searchParams = useSearchParams();
    const redirectUrl = searchParams.get("redirectUrl") || "/";

    const [isLoading, setIsLoading] = useState(false);

    const {
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
        setIsLoading(true);

        // Вызываем сервис (он сам обновит Zustand store и LocalStorage внутри)
        const success = await authService.login(
            data.username,
            data.password,
            data.rememberMe
        );

        if (success) {
            toaster.create({
                title: "Успешный вход",
                description: "Перенаправляем...",
                type: "success",
            });

            // Небольшая задержка для UX или мгновенный редирект
            router.push(redirectUrl);
            router.refresh(); // Обновляем роутер, чтобы пересчитались серверные компоненты (если есть)
        } else {
            toaster.create({
                title: "Ошибка входа",
                description: "Неверный логин или пароль",
                type: "error",
            });
        }

        setIsLoading(false);
    };

    return (
        <Box
            w="full"
            maxW="md"
            p={8}
            borderWidth={1}
            borderRadius="lg"
            boxShadow="lg"
            bg="bg.panel" // Chakra semantic token
        >
            <VStack gap={6} align="stretch">
                <Heading as="h2" size="xl" textAlign="center">
                    Вход в систему
                </Heading>

                <form onSubmit={handleSubmit(onSubmit)}>
                    <Stack gap={4}>
                        {/* Username Field */}
                        <Field
                            label="Пользователь"
                            invalid={!!errors.username}
                            errorText={errors.username?.message}
                        >
                            <Input
                                {...register("username")}
                                placeholder="Email или username"
                                autoComplete="username"
                            />
                        </Field>

                        {/* Password Field */}
                        <Field
                            label="Пароль"
                            invalid={!!errors.password}
                            errorText={errors.password?.message}
                        >
                            {/* В Chakra v3 часто используют композицию для пароля,
                   если нет готового компонента, используем Group */}
                            <Input
                                type="password"
                                {...register("password")}
                                placeholder="Ваш пароль"
                                autoComplete="current-password"
                            />
                        </Field>

                        {/* Remember Me - опционально, если нужен чекбокс */}
                        <Checkbox {...register("rememberMe")}>
                            Запомнить меня
                        </Checkbox>

                        <Button
                            type="submit"
                            colorPalette="blue"
                            size="lg"
                            loading={isLoading}
                            loadingText="Вход..."
                            mt={4}
                        >
                            Войти
                        </Button>
                    </Stack>
                </form>
            </VStack>
        </Box>
    );
}

export default function AuthPage() {
    return (
        <Container h="100vh" display="flex" alignItems="center" justifyContent="center">
            <Suspense fallback={<Center>Загрузка формы...</Center>}>
                <LoginForm/>
            </Suspense>
            <Toaster/>
        </Container>
    );
}