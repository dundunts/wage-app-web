import {render, screen} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {StatisticFilters} from "@/components/statistic/StatisticFilters";
import {Provider} from "@/components/ui/provider";
import {companyService} from "@/service/company/company.service";

const navigation = vi.hoisted(() => ({
    push: vi.fn(),
    replace: vi.fn(),
    searchParams: new URLSearchParams("periodType=CUSTOM"),
}));

vi.mock("next/navigation", () => ({
    usePathname: () => "/statistic",
    useRouter: () => navigation,
    useSearchParams: () => navigation.searchParams,
}));

vi.mock("@/service/company/company.service", () => ({
    companyService: {
        getForUser: vi.fn(),
    },
}));

function renderFilters() {
    render(
        <Provider defaultTheme="light">
            <StatisticFilters />
        </Provider>,
    );
}

describe("Statistic filters", () => {
    beforeEach(() => {
        navigation.push.mockReset();
        navigation.replace.mockReset();
        vi.mocked(companyService.getForUser).mockResolvedValue([
            {
                id: "company-1",
                title: "Кофейня",
                employeeWageCoefficientFromRevenue: 0.1,
                defaultShiftStartTime: "09:00",
            },
        ]);
    });

    it("exposes named period, Company, scope, and custom date controls", async () => {
        renderFilters();

        expect(await screen.findByRole("combobox", {name: "Рабочая точка"})).toBeVisible();
        expect(screen.getByRole("combobox", {name: "Период"})).toBeVisible();
        expect(screen.getByRole("tab", {name: "Личная"})).toBeVisible();
        expect(screen.getByRole("tab", {name: "Общая"})).toBeVisible();
        expect(screen.getByLabelText("Начало периода")).toHaveAttribute("type", "date");
        expect(screen.getByLabelText("Конец периода")).toHaveAttribute("type", "date");
    });
});
