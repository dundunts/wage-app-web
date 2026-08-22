import {adminPermissions, managerPermissions} from "@/constants/roles";

export interface NavItem {
    label: string;
    href?: string;
    children?: NavItem[];
    requiredPermissions?: string[];
}

export function filterNavItems(items: NavItem[], permissions: string[]): NavItem[] {
    return items.filter((item) =>
        (item.requiredPermissions ?? []).every((permission) => permissions.includes(permission)),
    );
}

export function isDestinationCurrent(item: NavItem, pathname: string): boolean {
    return Boolean(
        item.href && (pathname === item.href || pathname.startsWith(`${item.href}/`)),
    );
}

export function isRouteActive(item: NavItem, pathname: string): boolean {
    if (isDestinationCurrent(item, pathname)) return true;

    return item.children?.some((child) => isRouteActive(child, pathname)) ?? false;
}

export const navItems: NavItem[] = [
    {
        label: "Калькулятор",
        href: "/calculator",
        requiredPermissions: managerPermissions
    },
    {
        label: "Статистика",
        href: "/statistic"
    },
    {
        label: "Отчеты",
        href: "/results",
        requiredPermissions: managerPermissions
    },
    {
        label: "Админ. панель",
        children: [
            {
                label: "Компании",
                href: "/company"
            },
            {
                label: "Работники",
                href: "/employee"
            },
        ],
        requiredPermissions: adminPermissions
    },
];
