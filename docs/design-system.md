# Design system «Тихий реестр»

«Тихий реестр» — общая Chakra UI v3 тема Wage App Web. Она dark-first:
тёплый графит создаёт иерархию рабочих поверхностей, глубокий teal обозначает
основные действия, а яркий neon-teal используется редко — для focus, active и
selected состояний. Плотные данные важнее декоративных эффектов.

Источники истины:

- `src/theme/system.ts` — tokens, semantic roles, recipes и global CSS;
- `src/theme/chart.ts` — единственный CSS-variable bridge для Recharts;
- `src/components/ui/provider.tsx` — корневой Provider и dark mode по умолчанию;
- `src/feedback/` — action-boundary feedback facade. Тема меняет только
  представление и не обходит этот facade.

## Palette

Raw palette разрешена только в `src/theme/system.ts`. Feature-компоненты не
используют эти имена напрямую.

| Основа | Dark | Light | Назначение |
| --- | --- | --- | --- |
| Canvas | `#0d0d0c` | `#f7f6f2` | фон приложения |
| Warm canvas | `#12110f` | `#f1efe8` | shell/Header |
| Panel | `#171613` | `#fffefa` | основная поверхность |
| Raised | `#1e1c18` | `#ffffff` | menus, controls, overlays |
| Soft | `#24211c` | `#ebe8df` | hover, table header, subtle state |
| Text | `#f4f0e8` | `#1c1a17` | основной текст |
| Muted | `#a9a39a` | `#5f5a52` | вторичный текст |
| Quiet | `#8f887e` | `#6f675e` | служебные подписи |
| Accent | `#32f5d2` | `#00796f` | focus/active/selected |
| Solid action | `#0f766e` (`#107b72` hover) | `#0f766e` | primary button |
| Success | `#5dd39e` | `#21734d` | успешный результат |
| Info | `#75a7ff` | `#245eaa` | информация |
| Warning | `#e5b567` | `#855600` | предупреждение |
| Danger | `#ff7a7a` | `#b42332` | ошибка/destructive |
| Violet | `#a98cff` | `#6741b4` | вторичная серия графика |

Dark `quiet` намеренно светлее первоначального референса `#706b64`: исходное
значение не достигало WCAG AA для небольших table headers на soft surface.

## Semantic roles

Используйте роль, которая описывает смысл, а не оттенок.

| Role | Использование |
| --- | --- |
| `bg.canvas`, `bg.canvasWarm` | общий canvas и тёплая shell-поверхность |
| `bg.panel`, `bg.raised`, `bg.subtle` | уровни панелей и интерактивный фон |
| `fg`, `fg.muted`, `fg.quiet` | основной, вторичный и служебный текст |
| `border`, `border.muted`, `border.emphasized` | обычная, тихая и усиленная граница |
| `action.solid`, `action.hover`, `action.contrast` | primary action |
| `accent`, `accent.subtle`, `accent.border`, `accent.glow` | active/focus/selected и редкое свечение |
| `focus.ring` | единый keyboard focus indicator |
| `status.success`, `status.info`, `status.warning`, `status.danger` | текст/иконка статуса |
| `success.*`, `info.*`, `warning.*`, `danger.*` | Chakra `colorPalette` для status components |
| `overlay.backdrop` | общий backdrop Dialog/Drawer |
| `chart.*` | центральная палитра Recharts |

`brand` — совместимый Chakra color palette для основных controls. Он отображает
solid на глубокий teal, а focus и subtle состояния — на accent roles. Teal не
означает success.

## Typography

- Body и headings используют локальный `@fontsource-variable/manrope`; runtime
  запросов к font CDN нет.
- Заголовки имеют weight 700 и компактный отрицательный tracking. Не используйте
  editorial-размеры для рабочих экранов.
- Числа глобально используют `tabular-nums`; для сумм, часов и процентов
  сохраняйте `fontVariantNumeric="tabular-nums"`, если компонент переопределяет
  font settings.
- Иерархия `h1`–`h6` должна отражать структуру страницы, а не желаемый размер.

## Geometry and motion

- Controls: radius `control` (8 px).
- Panels/dialogs: radius `panel` (12 px), тонкая semantic border и `panel` shadow.
- Badge/tag: `full` radius.
- Формы комфортные; таблицы используют компактные строки и горизонтальный
  scroll container на узком viewport.
- Переходы используют `durations.quiet` (150 ms) и `easings.quiet`.
- При `prefers-reduced-motion: reduce` animations/transforms общих controls и
  overlays отключаются; global CSS также делает прочие transitions мгновенными.
- Glow допустим только у selected/active/focus и редких summary accents. Не
  добавляйте постоянный glow каждой карточке.

## Recipes

Общие recipes зарегистрированы в custom system:

- single-part: `Button`/`IconButton`, `Input`, `Textarea`, `Spinner`, `Badge`,
  `Heading`;
- slot: `Card`, `Checkbox`, `Select`, `Table`, `Tabs`, `Menu`, `Dialog`,
  `Drawer`, `Popover`, `Tooltip`, `Toast`, `Alert`.

Menus, popovers и tooltips используют raised surface; drawers — panel и общий
overlay backdrop. Dialog использует liquid-glass вариант общей panel surface:
полупрозрачный semantic background, усиленный backdrop blur/saturation и тихий
accent sheen. Этот эффект задаётся только общей dialog recipe; feature-компоненты
не дублируют его в `Dialog.Content`, `Dialog.Body` или footer. Toast/alert
остаются на нейтральной поверхности с текстом и semantic status
border/indicator. Поэтому статус не передаётся одним цветом.
Loading presentation использует accent spinner; окружающий экран должен
добавлять `role="status"` и понятный label/text, когда загрузка блокирует контент.

Для продуктовых действий доступны именованные recipe variants: `primary`,
`secondary`, `destructive`. Стандартные variants (`solid`, `outline`, `subtle`)
с semantic `colorPalette` (`brand`, `success`, `info`, `warning`, `danger`)
остаются для системных комбинаций. Локальный стиль допустим для layout, но не
должен дублировать цвет, shadow или radius темы.

## Charts

Recharts не понимает Chakra token names, поэтому `src/theme/chart.ts` переводит
их в semantic CSS variables. Это документированное исключение, а не локальная
палитра feature-компонента.

Порядок серий:

1. teal (`chart.primary`) — главная серия;
2. blue (`chart.blue`);
3. violet (`chart.violet`);
4. amber (`chart.amber`);
5. neutral (`chart.neutral`).

При повторении палитры `getChartSeriesStyle` добавляет dash pattern. Каждый
график также имеет видимый title/description, legend или прямые labels; цвет не
является единственным способом различить данные. Grid, axis, cursor и tooltip
surface используют `chart.grid`, `chart.axis`, `chart.cursor`, `bg.raised`.

## Accessibility contract

- Обычный текст, status text и controls должны достигать WCAG AA 4.5:1; крупный
  текст — 3:1.
- Neon-teal применяется как focus/active accent, а не как фон текста или всех
  primary buttons.
- Focus ring видим, не обрезан и имеет 2 px outline. Не удаляйте outline.
- Icon-only actions имеют `aria-label`; statuses содержат текст или accessible
  name; формы сохраняют `Field.Label` association и error text.
- Menu, Select, Dialog и Drawer сохраняют встроенную Chakra/Ark keyboard
  navigation. Trigger возвращает focus после закрытия; destructive confirmation
  сначала фокусирует безопасное действие.
- Mobile tables прокручиваются горизонтально, не скрывая строки и actions.
- Dark — default; light остаётся функциональным. Видимый theme switcher в
  production не добавляется.

Проверенные минимальные контрасты (WCAG relative luminance):

| Пара | Dark | Light | Требование |
| --- | ---: | ---: | ---: |
| обычный текст / panel | 15.92:1 | 17.20:1 | 4.5:1 |
| muted text / panel | 7.2:1 | 6.8:1 | 4.5:1 |
| quiet text / soft | 4.58:1 | 4.54:1 | 4.5:1 |
| primary action text / solid teal | 5.47:1 | 5.47:1 | 4.5:1 |
| primary action text / hover teal | 5.12:1 | 5.47:1 | 4.5:1 |
| focus ring / canvas | 14.01:1 | 4.53:1 | 3:1 |
| success/info/warning/danger text / panel | 7.17:1 minimum | 5.74:1 minimum | 4.5:1 |

Контраст следует повторно считать при изменении foundation palette, а затем
проверять computed styles в обоих color modes.

## Acceptance record — 2026-08-22

Финальная приёмка #27 выполнена в Chromium через локальный production UI без
добавления screenshot/E2E-инфраструктуры. Временный route с реальными
product-компонентами был удалён до build.

| Срез | Desktop 1280×800 | Mobile 390×844 | Dark | Light |
| --- | :---: | :---: | :---: | :---: |
| Auth и form validation | ✓ | ✓ | ✓ | ✓ |
| Header и mobile Drawer | ✓ | ✓ | ✓ | ✓ |
| Company / Employee: form, table, statuses, menu | ✓ | ✓ | ✓ | ✓ |
| Shift Session / Checkpoint | ✓ | ✓ | ✓ | ✓ |
| Shift Result / Payment / Payroll | ✓ | ✓ | ✓ | ✓ |
| Statistics chart, legend, axes, description | ✓ | ✓ | ✓ | ✓ |
| Dialog, alert, loading и overlay surfaces | ✓ | ✓ | ✓ | ✓ |

Проверено отсутствие page overflow; wide table сохраняет horizontal scroll.
Tabs и menus работают с клавиатуры; dialog сначала фокусирует безопасную кнопку;
menu, dialog и mobile Drawer возвращают focus trigger после Escape/закрытия.
Computed focus outline — 2 px `focus.ring`. Default `html` class — `dark`, после
переключения для smoke-check — `light`.

Browser host не предоставляет эмуляцию `prefers-reduced-motion`; при его обычном
значении `false` CSSOM проверен напрямую: присутствуют 44 reduce-правила,
включая global 0.01 ms fallback и recipe-правила с `transform: none`,
`animation-duration: 0ms` и `transition-duration: 0ms`.

## Do / don’t

```tsx
// Do: смысл выражен semantic role и общим recipe.
<Button colorPalette="brand">Подтвердить Shift Result</Button>
<Text color="status.danger">Не удалось сохранить</Text>
<Card.Root><Card.Body>…</Card.Body></Card.Root>

// Don't: feature выбирает raw shade и копирует системную геометрию.
<Button bg="teal.500" color="#fff" borderRadius="8px">Сохранить</Button>
<Box bg="rgba(23, 22, 19, .9)" boxShadow="0 18px 50px #000">…</Box>
```

```tsx
// Do: danger остаётся отдельным color palette и имеет текстовый label.
<Button colorPalette="danger">Удалить Employee</Button>

// Don't: neon используется как success или status передаётся только цветом.
<Box bg="accent" aria-label="" />
```

## Audit and type generation

После изменения production UI или темы выполните:

```shell
npm run theme:audit
npm run theme:typegen
npm run typecheck
```

`theme:audit` запрещает raw CSS colors, raw Chakra palette values и native
controls во всём production `src`, включая CSS/SCSS. Централизованные исключения:

1. foundation hex values и производные alpha/shadow expressions в
   `src/theme/system.ts`;
2. semantic CSS-variable bridge и SVG dash patterns в `src/theme/chart.ts`.

Chakra typegen запускается после любого изменения tokens или recipes. Generated
dependency typings являются install artifact и не коммитятся; корректность
custom tokens/recipes подтверждается typegen с `--strict`, затем обычным
TypeScript typecheck.
