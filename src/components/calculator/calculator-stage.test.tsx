import {render, screen, within} from "@testing-library/react";
import {describe, expect, it} from "vitest";
import type {ReactNode} from "react";
import {
    CalculatorStageHeader,
    CalculatorStageProgress,
} from "@/components/calculator/calculator-stage";
import {Provider} from "@/components/ui/provider";

function renderWithProvider(component: ReactNode) {
    return render(
        <Provider defaultTheme="dark">
            {component}
        </Provider>,
    );
}

describe("CalculatorStageProgress", () => {
    it("marks the current, completed, and future stages accessibly", () => {
        renderWithProvider(<CalculatorStageProgress currentStage={2} />);

        const progress = screen.getByRole("list", {name: "Этапы расчёта смены"});
        expect(within(progress).getByRole("listitem", {name: "1. Сессия: завершён"})).toBeVisible();
        expect(within(progress).getByRole("listitem", {name: "2. Checkpoint: текущий"})).toHaveAttribute(
            "aria-current",
            "step",
        );
        expect(within(progress).getByRole("listitem", {name: "3. Расчёт: ожидает"})).toBeVisible();
    });

    it("renders the shared stage heading and description", () => {
        renderWithProvider(
            <CalculatorStageHeader
                currentStage={3}
                title="Проверьте расчёт за день"
                description="Описание этапа"
            />,
        );

        expect(screen.getByText("Калькулятор смены · Этап 3")).toBeVisible();
        expect(screen.getByRole("heading", {name: "Проверьте расчёт за день"})).toBeVisible();
        expect(screen.getByText("Описание этапа")).toBeVisible();
    });
});
