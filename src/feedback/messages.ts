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
