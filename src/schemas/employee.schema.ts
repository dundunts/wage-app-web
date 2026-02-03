import { z } from "zod";
import { EmployeePosition } from "@/types/employee.types";

// Базовая схема полей
const employeeBaseSchema = z.object({
    firstName: z.string().min(1, "Имя обязательно"),
    lastName: z.string().min(1, "Фамилия обязательна"),
    patronymic: z.string().min(1, "Отчество обязательно"), // В интерфейсе оно required
    simpleName: z.string().nullable().optional(),
    userId: z.string().nullable().optional(), // Вводится вручную
    position: z.enum(EmployeePosition, {
        error: () => ({ message: "Выберите должность" }),
    }),
    companyIds: z.array(z.string()), // Many-to-many связь
});

export const createEmployeeSchema = employeeBaseSchema;

export const updateEmployeeSchema = employeeBaseSchema;

// Типы, выведенные из Zod, для использования в useForm
export type CreateEmployeeFormValues = z.infer<typeof createEmployeeSchema>;
export type UpdateEmployeeFormValues = z.infer<typeof updateEmployeeSchema>;