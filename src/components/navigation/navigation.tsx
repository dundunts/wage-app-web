interface NavItem {
    label: string;
    href?: string;
    children?: NavItem[]
}

export const navItems: NavItem[] = [
    {
        label: "Калькулятор",
        children: [
            {
                label: "Отчет внутри смены",
                href: "/calc/in-shift"
            },
            {
                label: "Отчет за день",
                href: "/calc/for-day"
            },
        ],
    },
    {
        label: "Статистика"
    },
    {
        label: "Отчеты"
    },
    {
        label: "Админ. панель",
        children: [
            {
                label: "Предприятия",
            },
            {
                label: "Работники",
            },
        ],
    },
];