// @/schemas/auth.schema.ts
import { z } from "zod";

export const loginSchema = z.object({
    username: z.string().min(1, "Введите имя пользователя или email"),
    password: z.string().min(1, "Введите пароль"),
    rememberMe: z.boolean(),
});

export type LoginSchemaType = z.infer<typeof loginSchema>;