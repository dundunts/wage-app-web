import {PeriodType} from "@/types/salary.types";

interface PeriodRange {
    periodType: string;
    start?: string;
    end?: string;
}

function isCalendarDate(value: string): boolean {
    if (!/^\d{4}-\d{2}-\d{2}$/.test(value) || value.startsWith("0000-")) return false;
    const date = new Date(`${value}T00:00:00Z`);
    return !Number.isNaN(date.getTime()) && date.toISOString().slice(0, 10) === value;
}

export function getPeriodValidationMessage({periodType, start, end}: PeriodRange): string | null {
    if (periodType !== PeriodType.CUSTOM) return null;
    if (!start || !end) return "Укажите начало и конец периода.";
    if (!isCalendarDate(start) || !isCalendarDate(end)) return "Укажите корректные даты периода.";
    if (start > end) return "Дата начала не может быть позже даты окончания.";
    return null;
}
