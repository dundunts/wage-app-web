import {adminPermissions, managerPermissions} from "@/constants/roles";

export interface NavItem {
    label: string;
    href?: string;
    children?: NavItem[];
    requiredPermissions?: string[];
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
                label: "Предприятия",
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