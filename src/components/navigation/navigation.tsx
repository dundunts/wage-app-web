export interface NavItem {
    label: string;
    href?: string;
    children?: NavItem[]
}

export const navItems: NavItem[] = [
    {
        label: "Калькулятор",
        href: "/calculator"
    },
    {
        label: "Статистика",
        href: "/statistic"
    },
    {
        label: "Отчеты",
        href: "/results"
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
    },
];