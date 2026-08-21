import {render, screen, waitFor} from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import {beforeEach, describe, expect, it, vi} from "vitest";
import CalculatorCompanyPage from "@/app/(main)/calculator/page";
import {Provider} from "@/components/ui/provider";
import {companyService} from "@/service/company/company.service";

const navigation = vi.hoisted(() => ({
    push: vi.fn(),
    replace: vi.fn(),
}));

vi.mock("next/navigation", () => ({
    useRouter: () => navigation,
}));

vi.mock("@/service/company/company.service", () => ({
    companyService: {
        getForUser: vi.fn(),
    },
}));

const companies = [
    {
        id: "company-1",
        title: "Север",
        employeeWageCoefficientFromRevenue: 350,
        defaultShiftStartTime: "09:00",
    },
    {
        id: "company-2",
        title: "Юг",
        employeeWageCoefficientFromRevenue: 400,
        defaultShiftStartTime: "10:00",
    },
];

function renderPage() {
    render(
        <Provider defaultTheme="dark">
            <CalculatorCompanyPage />
        </Provider>,
    );
}

beforeEach(() => {
    navigation.push.mockReset();
    navigation.replace.mockReset();
    vi.mocked(companyService.getForUser).mockReset();
});

describe("Company selection for the calculator", () => {
    it("lets a keyboard user select a Company and enters its sessions", async () => {
        const user = userEvent.setup();
        vi.mocked(companyService.getForUser).mockResolvedValue(companies);
        renderPage();

        const north = await screen.findByRole("button", {name: "Выбрать компанию «Север»"});
        expect(north).toHaveAttribute("aria-pressed", "false");

        await user.tab();
        expect(north).toHaveFocus();
        await user.keyboard("{Enter}");

        expect(north).toHaveAttribute("aria-pressed", "true");
        expect(navigation.push).toHaveBeenCalledWith(
            "/calculator/session?companyId=company-1",
        );
    });

    it("keeps the existing automatic entry rule for a single Company", async () => {
        vi.mocked(companyService.getForUser).mockResolvedValue([companies[0]]);
        renderPage();

        await waitFor(() => {
            expect(navigation.replace).toHaveBeenCalledWith(
                "/calculator/session?companyId=company-1",
            );
        });
        expect(screen.queryByRole("button", {name: /Выбрать компанию/})).not.toBeInTheDocument();
    });
});
