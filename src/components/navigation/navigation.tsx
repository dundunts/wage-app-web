export interface NavItem {
    label: string;
    href?: string;
    children?: NavItem[]
}

export const navItems: NavItem[] = [
    {
        label: "Калькулятор",
        href: "/calculator"
        // children: [
        //     {
        //         label: "Отчет внутри смены",
        //         href: "/calc/in-shift"
        //     },
        //     {
        //         label: "Отчет за день",
        //         href: "/calc/for-day"
        //     },
        // ],
    },
    {
        label: "Статистика"
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