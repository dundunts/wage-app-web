"use client";

import {useMountEffect} from "@/hooks/useMountEffect";
import {useState} from "react";
import {authService} from "@/service/auth.service";

export default function AuthInitializer() {
    const [initialized, setInitialized] = useState(false);

    useMountEffect(() => {
        authService.checkAuth()
            .finally(() => setInitialized(true))
    });

    // Пока идёт инициализация можно отдать null или лоадер
    if (!initialized) {
        return null; // или <Spinner />
    }

    return null; // компонент ничего не рендерит, он только инициализирует store
}
