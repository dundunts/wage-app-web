# Wage App Web

🚧 **Статус проекта: активная разработка (используется в продакшене)**

Frontend-приложение для системы **расчёта заработной платы сотрудников**, разработанное как клиент к wage-app-backend.

Позволяет управлять рабочими сменами, дневными отчётами и расчетом зарплат, а также предоставляет инструменты администрирования сотрудников и предприятий.

---

## 📌 О проекте

**Wage App Web** — это SPA/SSR веб-клиент, позволяющий:

- учитывать смены сотрудников
- фиксировать дневные отчёты
- автоматически рассчитывать зарплату
- анализировать выплаты

Приложение разделено на пользовательскую и административную части.

---

## ⚙️ Основной функционал

### 👤 Пользователь (рядовой сотрудник)

- Просмотр истории выплат
- Просмотр агрегированной статистики (доходы, динамика)

---

### 💼 Менеджер

- Управление сменами
- Создание и редактирование отчётов за день
- Расчёт заработной платы на основе смен и отчётов

---

### 🛠 Администратор

- Управление сотрудниками
- Управление предприятиями

---

## 🧱 Архитектура

Проект построен с использованием современных подходов фронтенд-разработки:

- **Next.js (App Router)** — SSR + SPA
- **React + TypeScript**
- **API слой** для работы с backend
- **Управление состоянием** (Zustand)

### Основные слои:

- `app/` - страницы и роутинг
- `api/` - обращения к backend
- `service/` - сервисы
- `data/` - работа с данными (local storage)
- `store/` - состояния (Zustand)
- `types/` - доменные типы
- `components/` - компоненты страниц
- `schemas/` - схемы валидации форм

---

## 🛠 Технологии

- React
- Next.js
- TypeScript
- Axios
- Chakra UI v3

---

## 🔗 Связанные репозитории

- Backend: [wage-app-backend](https://github.com/dundunts/wage-app)

---

## 👨‍💻 Автор

Даниил Коновалов
Java / Kotlin Backend Developer

Telegram: @turterDun

Email: DunDunTs@yandex.ru

## Immutable production releases

Production publication starts only from an annotated `vX.Y.Z` or
`vX.Y.Z-U<N>` tag whose commit belongs to `release/X.Y.Z`. The workflow tests
and builds that source, publishes `dundunts/wage-app-web:<version>` and
`git-<sha>` once, records their common digest, and opens an image-only GitOps
pull request. It never receives Kubernetes credentials.

An owner provisions the Docker Hub and narrowly scoped GitHub App credentials
without exposing them to the terminal log or repository:

```shell
./scripts/setup-web-release.sh
```
