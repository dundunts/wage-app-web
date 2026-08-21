import type {ApplicationErrorCategory} from "@/feedback/api-error";

export const feedbackMessages = {
    companyCreate: {
        success: "Компания создана",
        error: "Компания не создана",
        warning: "Создание компании требует внимания",
        information: "Создание компании",
        loading: "Компания создаётся",
    },
    companyUpdate: {
        success: "Компания обновлена",
        error: "Компания не обновлена",
        warning: "Изменение компании требует внимания",
        information: "Изменение компании",
        loading: "Компания обновляется",
    },
    companyDelete: {
        success: "Компания удалена",
        error: "Компания не удалена",
        warning: "Удаление компании требует внимания",
        information: "Удаление компании",
        loading: "Компания удаляется",
    },
    employeeCreate: {
        success: "Сотрудник создан",
        error: "Сотрудник не создан",
        warning: "Создание сотрудника требует внимания",
        information: "Создание сотрудника",
        loading: "Сотрудник создаётся",
    },
    employeeUpdate: {
        success: "Сотрудник обновлён",
        error: "Сотрудник не обновлён",
        warning: "Изменение сотрудника требует внимания",
        information: "Изменение сотрудника",
        loading: "Сотрудник обновляется",
    },
    employeeDelete: {
        success: "Сотрудник удалён",
        error: "Сотрудник не удалён",
        warning: "Удаление сотрудника требует внимания",
        information: "Удаление сотрудника",
        loading: "Сотрудник удаляется",
    },
    employeeListLoad: {
        success: "Список сотрудников загружен",
        error: "Список сотрудников не загружен",
        warning: "Загрузка списка сотрудников требует внимания",
        information: "Загрузка списка сотрудников",
        loading: "Список сотрудников загружается",
    },
    employeeDetailLoad: {
        success: "Данные сотрудника загружены",
        error: "Данные сотрудника не загружены",
        warning: "Загрузка данных сотрудника требует внимания",
        information: "Загрузка данных сотрудника",
        loading: "Данные сотрудника загружаются",
    },
    shiftSessionOpen: {
        success: "Смена открыта",
        error: "Смена не открыта",
        warning: "Открытие смены требует внимания",
        information: "Открытие смены",
        loading: "Смена открывается",
    },
    shiftSessionUpdateTime: {
        success: "Время начала смены обновлено",
        error: "Время начала смены не обновлено",
        warning: "Изменение времени смены требует внимания",
        information: "Изменение времени смены",
        loading: "Время смены обновляется",
    },
    shiftSessionClose: {
        success: "Смена закрыта",
        error: "Смена не закрыта",
        warning: "Закрытие смены требует внимания",
        information: "Закрытие смены",
        loading: "Смена закрывается",
    },
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
    payrollExport: {
        success: "Excel-отчёт скачан",
        error: "Excel-отчёт не скачан",
        warning: "Экспорт Excel требует внимания",
        information: "Экспорт Excel",
        loading: "Excel-отчёт формируется",
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

export const feedbackActionLabels = {
    retry: "Повторить",
} as const;

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

const shiftSessionConflictDescription =
    "Состояние смены изменилось. Обновите данные и попробуйте ещё раз";

export const actionErrorDescriptions: Partial<Record<
    FeedbackActionKey,
    Partial<Record<ApplicationErrorCategory | "default", string>>
>> = {
    shiftSessionOpen: {
        conflict: shiftSessionConflictDescription,
    },
    shiftSessionUpdateTime: {
        conflict: shiftSessionConflictDescription,
    },
    shiftSessionClose: {
        conflict: shiftSessionConflictDescription,
    },
    login: {
        sessionExpired: "Неверное имя пользователя или пароль",
    },
    logout: {
        default: "Данные входа удалены на этом устройстве, но завершить сеанс на сервере не удалось",
    },
};
