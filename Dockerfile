# ————————————————
# 1️⃣ Билд-этап
# ————————————————
FROM node:20-alpine AS builder
WORKDIR /app

# Устанавливаем зависимости отдельно, чтобы кэшировать
COPY package*.json ./
RUN npm ci

# Копируем остальной код проекта
COPY . .

# Отключаем ESLint, типизацию и телеметрию при сборке
ENV NEXT_TELEMETRY_DISABLED=1
ENV NEXT_SKIP_ESLINT=1
ENV NEXT_SKIP_TYPE_CHECK=1

# Собираем Next.js проект
RUN npm run build

# ————————————————
# 2️⃣ Рантайм-этап
# ————————————————
FROM node:20-alpine AS runner
WORKDIR /app

RUN addgroup --system --gid 10001 nextjs \
    && adduser --system --uid 10001 --ingroup nextjs nextjs

ENV NODE_ENV=production
ENV NEXT_TELEMETRY_DISABLED=1
ENV PORT=3000

# Копируем только нужные артефакты
COPY --from=builder /app/package*.json ./
COPY --from=builder /app/.next ./.next
COPY --from=builder /app/public ./public
COPY --from=builder /app/next.config.ts ./next.config.ts
COPY --from=builder /app/node_modules ./node_modules

# Если используешь TypeScript, добавим tsconfig
COPY --from=builder /app/tsconfig.json ./tsconfig.json

RUN chown -R nextjs:nextjs /app
USER nextjs

ENV NODE_ENV=production
ENV PORT=3000

EXPOSE 3000
CMD ["npm", "start"]
