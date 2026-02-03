// @/schemas/company.schema.ts
import { z } from "zod";

export const companySchema = z.object({
    title: z.string().min(1, "Название обязательно для заполнения"),
    // Валидируем то, что вводит пользователь (проценты: 0 - 100)
    employeeWageCoefficientFromRevenue: z
        .union([z.number(), z.string()])
        .transform((val) => Number(val))
        .pipe(
            z.number()
                .min(0, "Не может быть отрицательным")
                .max(100, "Максимум 100%")
        ),
    defaultShiftStartTime: z
        .string()
        .regex(/^([0-1]?[0-9]|2[0-3]):[0-5][0-9]$/, "Введите время в формате ЧЧ:ММ"),
});

export type CompanyFormValues = z.infer<typeof companySchema>;