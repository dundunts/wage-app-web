import {act, renderHook, waitFor} from "@testing-library/react";
import {beforeEach, describe, expect, it, vi} from "vitest";
import {useSalaryStatistic} from "@/hooks/useSalaryStatistic";
import {salaryService} from "@/service/salary/salary.service";
import {Payroll, PayrollType, PeriodType, StatisticScope} from "@/types/salary.types";
import {StatisticFilters} from "@/hooks/useStatisticFilter";

vi.mock("@/service/salary/salary.service", () => ({
    salaryService: {getStaff: vi.fn(), getOwn: vi.fn()},
}));

const payroll: Payroll = {type: PayrollType.BY_DAY, elements: [], summaries: []};
const baseFilters: StatisticFilters = {
    companyId: "company-1", scope: StatisticScope.STAFF, periodType: PeriodType.CURRENT,
};

beforeEach(() => {
    vi.mocked(salaryService.getStaff).mockReset().mockResolvedValue(payroll);
    vi.mocked(salaryService.getOwn).mockReset().mockResolvedValue(payroll);
});

describe("Statistics period validation", () => {
    it.each([
        {scope: StatisticScope.STAFF},
        {scope: StatisticScope.OWN, start: "2026-10-31"},
        {scope: StatisticScope.STAFF, start: "2026-10-31", end: "2026-10-30"},
        {scope: StatisticScope.OWN, start: "2026-02-30", end: "2026-03-01"},
    ])("does not request invalid custom dates: %j", async (dates) => {
        const {result} = renderHook(() => useSalaryStatistic({
            ...baseFilters, periodType: PeriodType.CUSTOM, ...dates,
        }));
        await act(async () => {});
        expect(salaryService.getStaff).not.toHaveBeenCalled();
        expect(salaryService.getOwn).not.toHaveBeenCalled();
        expect(result.current.data).toBeNull();
        expect(result.current.isLoading).toBe(false);
    });

    it("clears previous statistics when a custom period is incomplete", async () => {
        const {result, rerender} = renderHook(useSalaryStatistic, {initialProps: baseFilters});
        await waitFor(() => expect(result.current.data).toBe(payroll));
        rerender({...baseFilters, periodType: PeriodType.CUSTOM, start: "2026-10-31"});
        expect(result.current.data).toBeNull();
        expect(result.current.isLoading).toBe(false);
        expect(salaryService.getStaff).toHaveBeenCalledOnce();
    });

    it("keeps the latest scope when an earlier request resolves afterwards", async () => {
        let resolveStaff!: (value: Payroll) => void;
        vi.mocked(salaryService.getStaff).mockReturnValue(new Promise((resolve) => {
            resolveStaff = resolve;
        }));
        const ownPayroll = {...payroll};
        vi.mocked(salaryService.getOwn).mockResolvedValue(ownPayroll);
        const {result, rerender} = renderHook(useSalaryStatistic, {initialProps: baseFilters});
        rerender({...baseFilters, scope: StatisticScope.OWN});
        await waitFor(() => expect(result.current.data).toBe(ownPayroll));
        await act(async () => resolveStaff(payroll));
        expect(result.current.data).toBe(ownPayroll);
    });

    it.each([PeriodType.CURRENT, PeriodType.PREVIOUS, PeriodType.CUSTOM])(
        "continues loading a valid %s period", async (periodType) => {
            const {result} = renderHook(() => useSalaryStatistic({
                ...baseFilters, periodType, start: "2026-10-31", end: "2026-10-31",
            }));
            await waitFor(() => expect(result.current.data).toBe(payroll));
            expect(salaryService.getStaff).toHaveBeenCalledOnce();
        },
    );
});
