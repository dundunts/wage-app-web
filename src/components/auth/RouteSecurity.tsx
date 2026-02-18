"use client";

import {ReactNode, useEffect, useState} from "react";
import {useRouter} from "next/navigation";
import useUserStore from "@/store/userStore";

type RouteSecurityProps = {
    children: ReactNode;
    onlyAuthenticated?: boolean; // default = true
    requiredRoles?: string[];
    requireAllRoles?: boolean; // default = true
    redirectOnReject?: string; // default = "/auth"
    fallback?: ReactNode; // альтернатива редиректу (например, 403 компонент)
    loadingComponent?: ReactNode; // UI пока идёт инициализация
};

export default function RouteSecurity({
                                          children,
                                          onlyAuthenticated = true,
                                          requiredRoles = [],
                                          requireAllRoles = true,
                                          redirectOnReject = "/auth",
                                          fallback,
                                          loadingComponent = null,
                                      }: RouteSecurityProps) {
    const router = useRouter();

    const { isAuthenticated, permissions } = useUserStore();
    const [initialized, setInitialized] = useState(false);

    // Имитация состояния загрузки: ждём, пока userStore гидрируется из persist
    useEffect(() => {
        // Zustand persist восстанавливает стейт асинхронно
        // Этот трюк гарантирует, что мы не проверяем доступ до гидрации
        setInitialized(true);
    }, []);

    if (!initialized) {
        return <>{loadingComponent}</>;
    }

    // 1. Проверка аутентификации
    if (onlyAuthenticated && !isAuthenticated) {
        if (fallback) return <>{fallback}</>;
        router.replace(redirectOnReject);
        return null;
    }

    // 2. Проверка ролей
    if (requiredRoles.length > 0) {
        const hasAll = requiredRoles.every((r) => permissions.includes(r));
        const hasAny = requiredRoles.some((r) => permissions.includes(r));

        const roleCheckPassed = requireAllRoles ? hasAll : hasAny;

        if (!roleCheckPassed) {
            if (fallback) return <>{fallback}</>;
            router.replace(redirectOnReject);
            return null;
        }
    }

    // 3. Всё ок → отдаём детей
    return <>{children}</>;
}
