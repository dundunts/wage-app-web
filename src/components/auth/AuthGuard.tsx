// @/components/auth/AuthGuard.tsx
"use client";

import { useEffect, useState } from "react";
import { usePathname, useRouter, useSearchParams } from "next/navigation";
import { authService } from "@/service/auth.service";
import useUserStore from "@/store/userStore";
import { Center, Spinner, VStack, Text } from "@chakra-ui/react";
import { isPublicRoute, ROLE_PROTECTED_ROUTES } from "@/config/routes.config";
import { useShallow } from "zustand/react/shallow"; // ! ВАЖНО: Импорт для сравнения объектов

interface AuthGuardProps {
    children: React.ReactNode;
}

export default function AuthGuard({ children }: AuthGuardProps) {
    const router = useRouter();
    const pathname = usePathname();
    const searchParams = useSearchParams();
    const [isMounted, setIsMounted] = useState(false);

    // ! ИСПРАВЛЕНИЕ: Используем useShallow для стабильности селектора
    const { isAuthenticated, permissions } = useUserStore(
        useShallow((state) => ({
            isAuthenticated: state.isAuthenticated,
            permissions: state.permissions,
        }))
    );

    const [isChecking, setIsChecking] = useState(true);

    // 1. Предотвращаем гидратацию (Hydration Mismatch), так как используем persist
    useEffect(() => {
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setIsMounted(true);
    }, []);

    // 2. Первичная проверка токена
    useEffect(() => {
        // Ждем монтирования, чтобы zustand успел подтянуть данные из localStorage
        if (!isMounted) return;

        const initAuth = async () => {
            // Можно добавить проверку: если мы уже auth по localstorage, то checkAuth делает refresh
            await authService.checkAuth();
            setIsChecking(false);
        };
        initAuth();
    }, [isMounted]);

    // 3. Реакция на изменение пути
    useEffect(() => {
        if (isChecking || !isMounted) return;

        // Сценарий A: Пользователь авторизован и идет на /auth
        if (isAuthenticated && pathname.startsWith('/auth')) {
            const redirectUrl = searchParams.get('redirectUrl') || '/';
            router.replace(redirectUrl);
            return;
        }

        // Сценарий B: Публичный путь
        if (isPublicRoute(pathname)) {
            return;
        }

        // Сценарий C: НЕ авторизован -> редирект на вход
        if (!isAuthenticated) {
            // Сохраняем текущий URL, чтобы вернуться после логина
            const returnUrl = encodeURIComponent(pathname + "?" + searchParams.toString());
            // Убираем лишний ? если параметров нет
            const safeReturnUrl = searchParams.toString() ? returnUrl : encodeURIComponent(pathname);

            router.replace(`/auth?redirectUrl=${safeReturnUrl}`);
            return;
        }

        // Сценарий D: Проверка ролей (RBAC)
        const protectedPath = Object.keys(ROLE_PROTECTED_ROUTES).find(route =>
            pathname.startsWith(route)
        );

        if (protectedPath) {
            const requiredRoles = ROLE_PROTECTED_ROUTES[protectedPath];
            if (requiredRoles.length > 0) {
                const hasPermission = requiredRoles.some(role => permissions.includes(role));
                if (!hasPermission) {
                    console.warn(`Access denied. User roles: ${permissions}, Required: ${requiredRoles}`);
                    router.replace('/');
                }
            }
        }

    }, [pathname, isAuthenticated, isChecking, isMounted, router, searchParams, permissions]);

    // Пока не смонтирован компонент или идет проверка - показываем лоадер
    // Это критично для next.js + zustand persist, чтобы серверный HTML не отличался от клиентского
    if (!isMounted || isChecking) {
        return (
            <Center role="status" aria-label="Система загружается" h="100vh">
                <VStack gap={4}>
                    <Spinner size="xl" />
                    <Text color="fg.muted">Загрузка системы...</Text>
                </VStack>
            </Center>
        );
    }

    // Если проверки прошли, но мы всё еще не авторизованы (и это не публичный роут)
    // Возвращаем null, чтобы не мелькал контент до редиректа
    if (!isAuthenticated && !isPublicRoute(pathname)) {
        return null;
    }

    return <>{children}</>;
}
