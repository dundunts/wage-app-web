import {render, screen} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import {PayrollChart} from "@/components/statistic/PayrollCharts";
import {PayrollEmployeeChart} from "@/components/statistic/StaffStatistic";
import {Provider} from "@/components/ui/provider";

function renderWithProvider(children: React.ReactNode) {
    render(
        <Provider defaultTheme="light">
            {children}
        </Provider>,
    );
}

describe("Payroll charts", () => {
    it("names and describes the daily Payroll visualization", () => {
        renderWithProvider(
            <PayrollChart
                days={[
                    {date: "2026-08-20", total: 1_500, percent: 1_200, tips: 300},
                    {date: "2026-08-21", total: 1_800, percent: 1_400, tips: 400},
                ]}
                type="line"
                title="Доход по дням"
            />,
        );

        const chart = screen.getByRole("figure", {name: "Доход по дням"});
        expect(chart).toHaveAccessibleDescription(
            "Линейный график суммы выплат по датам. Основная серия: сумма выплат.",
        );
        expect(screen.getByRole("listitem")).toHaveTextContent("Сумма выплат");
    });

    it("names the staff visualization and exposes every Employee in its legend", () => {
        renderWithProvider(
            <PayrollEmployeeChart
                data={[{
                    date: "2026-08-21",
                    employee1: 1_000,
                    employee2: 800,
                    employee3: 750,
                    employee4: 700,
                    employee5: 650,
                    employee6: 600,
                }]}
                employeeIds={[
                    "employee1",
                    "employee2",
                    "employee3",
                    "employee4",
                    "employee5",
                    "employee6",
                ]}
                labelsByDataKey={{
                    employee1: "Анна А.",
                    employee2: "Борис Б.",
                    employee3: "Вера В.",
                    employee4: "Глеб Г.",
                    employee5: "Дарья Д.",
                    employee6: "Елена Е.",
                }}
            />,
        );

        const chart = screen.getByRole("figure", {name: "Выплаты сотрудникам по дням"});
        expect(chart).toHaveAccessibleDescription(
            "Столбчатая диаграмма выплат сотрудникам по датам. Серии перечислены в легенде.",
        );
        expect(screen.getAllByRole("listitem").map((item) => item.textContent)).toEqual([
            "Анна А.",
            "Борис Б.",
            "Вера В.",
            "Глеб Г.",
            "Дарья Д.",
            "Елена Е.",
        ]);
    });
});
