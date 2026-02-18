// @/config/routes.config.ts

export const PUBLIC_ROUTES = ['/auth', '/404', '/500'];

// Маршруты, доступные только авторизованным (по умолчанию все, кроме публичных).
// Здесь можно указать специфические роли для конкретных путей.
export const ROLE_PROTECTED_ROUTES: Record<string, string[]> = {
    '/admin': ['ADMIN', 'SUPER_ADMIN'],
    '/settings': ['USER', 'ADMIN'],
    // Пример: '/dashboard': [] // пустой массив = доступно всем авторизованным
};

/**
 * Проверяет, является ли маршрут публичным
 */
export const isPublicRoute = (path: string) => {
    return PUBLIC_ROUTES.some(route => path.startsWith(route));
};