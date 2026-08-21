import type {ApplicationErrorCategory} from "@/feedback/api-error";

export const feedbackMessages = {
    shiftResultSave: {
        success: "Результат смены сохранён",
        error: "Результат смены не сохранён",
        warning: "Сохранение результата смены требует внимания",
        information: "Сохранение результата смены",
        loading: "Результат смены сохраняется",
    },
    shiftResultDraftConfirm: {
        success: "Результат смены создан",
        error: "Результат смены не создан",
        warning: "Подтверждение результата смены требует внимания",
        information: "Подтверждение результата смены",
        loading: "Результат смены создаётся",
    },
    shiftResultDraftDiscard: {
        success: "Черновик результата смены удалён",
        error: "Черновик результата смены не удалён",
        warning: "Удаление черновика результата смены требует внимания",
        information: "Удаление черновика результата смены",
        loading: "Черновик результата смены удаляется",
    },
    shiftResultDelete: {
        success: "Результат смены удалён",
        error: "Результат смены не удалён",
        warning: "Удаление результата смены требует внимания",
        information: "Удаление результата смены",
        loading: "Результат смены удаляется",
    },
    login: {
        success: "Вход выполнен",
        error: "Войти не удалось",
        warning: "Вход требует внимания",
        information: "Вход в систему",
        loading: "Выполняется вход",
    },
    logout: {
        success: "Вы вышли из системы",
        error: "Вы вышли из системы",
        warning: "Выход требует внимания",
        information: "Выход из системы",
        loading: "Выполняется выход",
    },
    sessionExpired: {
        success: "Сессия обновлена",
        error: "Сессия завершена",
        warning: "Сессия требует внимания",
        information: "Состояние сессии изменилось",
        loading: "Сессия обновляется",
    },
} as const;

export type FeedbackActionKey = keyof typeof feedbackMessages;

export const applicationErrorDescriptions: Record<ApplicationErrorCategory, string> = {
    invalidRequest: "Проверьте введённые данные",
    sessionExpired: "Сессия истекла. Войдите снова",
    insufficientAccess: "Недостаточно прав для выполнения действия",
    notFound: "Объект больше недоступен. Обновите данные",
    conflict: "Возник конфликт данных. Проверьте выбранную дату и список сотрудников",
    serverFailure: "Сервис временно недоступен. Попробуйте позже",
    connectivity: "Не удалось связаться с сервером. Проверьте подключение к интернету",
    unknown: "Не удалось выполнить действие. Попробуйте ещё раз",
};

export const actionErrorDescriptions: Partial<Record<
    FeedbackActionKey,
    Partial<Record<ApplicationErrorCategory | "default", string>>
>> = {
    login: {
        sessionExpired: "Неверное имя пользователя или пароль",
    },
    logout: {
        default: "Данные входа удалены на этом устройстве, но завершить сеанс на сервере не удалось",
    },
};
