# Обзор Wage App Web

Этот документ помогает новому разработчику быстро понять назначение frontend,
его границы и место в системе. Канонические доменные термины определены в
[`CONTEXT.md`](../CONTEXT.md).

## Назначение

Wage App Web — frontend системы учёта рабочих смен и выплат. Он предоставляет
интерфейс к REST API Wage App Backend, но не владеет правилами расчёта, API-
контрактом или production-конфигурацией.

Основные пользовательские области:

- Employee просматривает личную статистику и Payroll;
- менеджер ведёт Shift Session, добавляет Checkpoint, проверяет Shift Result
  Draft и подтверждает Shift Result;
- администратор управляет Company и Employee.

Доступ к разделам определяется permissions из JWT Keycloak. Position сотрудника
является доменным обозначением и не заменяет permission.

## Основной сценарий

1. Пользователь выбирает Company и открывает или продолжает Shift Session.
2. При изменении команды добавляет Checkpoint с накопленными Revenue и
   Restaurant Tips.
3. Backend рассчитывает Shift Result Draft.
4. После проверки draft подтверждается как Shift Result.
5. Payments доступны в результатах смены и агрегируются в Payroll.

## Устройство frontend

Приложение построено на Next.js App Router, React и TypeScript. Chakra UI
используется для интерфейса, Axios — для HTTP, Zustand — для пользовательского
состояния, React Hook Form и Zod — для форм, Recharts — для графиков.

Основные каталоги:

- `src/app` — страницы, layouts и маршрутизация;
- `src/components` — интерфейсные компоненты;
- `src/api` — клиенты backend API;
- `src/service` — прикладные сценарии над API;
- `src/store` и `src/data` — состояние пользователя и браузерное хранение;
- `src/types` и `src/schemas` — типы данных и схемы форм.

Frontend аутентифицируется через Keycloak, хранит токены в браузере и отправляет
Bearer JWT в запросах к `/api/v1`.

## Источники истины

- этот репозиторий владеет UI, клиентской логикой, Dockerfile и публикацией web-
  образа;
- [backend](https://github.com/dundunts/wage-app) владеет доменной логикой и
  данными;
- [OpenAPI bundle](https://raw.githubusercontent.com/dundunts/wage-app/main/openapi/bundled/openapi.yaml)
  является опубликованным контрактом inbound REST API backend;
- [wage-app-infr](https://github.com/dundunts/wage-app-infr) владеет Helm chart,
  production values и GitOps desired state;
- актуальный delivery flow описан в
  [CI/CD and GitOps architecture](https://github.com/dundunts/wage-app-infr/blob/main/docs/architecture/ci-cd-gitops.md).

Подробности соседних компонентов следует читать в их репозиториях, а не
дублировать здесь.

Визуальные правила и способы расширения темы описаны в
[`docs/design-system.md`](design-system.md).

## Локальная разработка

Нужны Node.js 20, npm, доступные backend и Keycloak.

```shell
cp .env.sample .env.local
npm ci
npm run dev
```

Перед pull request выполняются:

```shell
npm run lint
npm run typecheck
npm run build
npm run test:release
```

## CI/CD и production

Обычный CI проверяет release contract, lint, типы и production build. Отдельный
release workflow принимает аннотированный тег `vX.Y.Z` или `vX.Y.Z-U<N>` из
соответствующей ветки `release/X.Y.Z`, публикует неизменяемый Docker-образ и
открывает ограниченный image-only pull request в `wage-app-infr`.

После merge Argo CD синхронизирует зафиксированный image digest. Web развёрнут
как отдельное Kubernetes-приложение с HTTPS endpoint; Docker Compose пока
сохраняется как production fallback, а окончательный traffic cutover не
зафиксирован как завершённый.

## Текущие границы

- у frontend пока нет отдельного набора unit, integration или E2E-тестов;
- API следует менять начиная с OpenAPI-контракта backend;
- runtime и deployment-настройки изменяются через `wage-app-infr`, а не в
  frontend-коде;
- сведения о параллельном Kubernetes-контуре и Compose могут измениться, поэтому
  операционный статус следует проверять в infra-репозитории.
