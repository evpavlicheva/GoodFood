# GoodFood — Техническая документация

> Полное руководство по воссозданию приложения с нуля.

---

## 1. Концепция приложения

**GoodFood** — веб-приложение в стиле Duolingo для детей и родителей, которое превращает приём пищи в игру. Ребёнок выбирает блюда из меню, зарабатывает монеты за здоровую еду, тратит их на снеки и разблокировку mascot-персонажей. Родитель управляет меню, получает заказы и отправляет напоминания через push-уведомления.

**Целевая аудитория:** дети 6–15 лет + их родители.

---

## 2. Технологический стек

| Слой | Технология |
|---|---|
| Фреймворк | Next.js 15 (App Router) |
| Язык | TypeScript 5 |
| Стили | Tailwind CSS 3 |
| Анимации | Framer Motion 11 |
| База данных | Supabase (PostgreSQL + Storage) |
| AI-анализ фото | Anthropic API (claude-haiku-4-5-20251001) |
| Push-уведомления | Web Push API + web-push npm |
| Деплой | Vercel |
| Шрифты | Baloo 2 (заголовки) + Nunito (текст) — Google Fonts |

---

## 3. Структура папок

```
goodfood/
├── public/
│   ├── icons/
│   │   ├── logo.png          # Логотип приложения
│   │   └── coin1.png         # Иконка монеты
│   ├── mascots/
│   │   ├── broccoli.png      # Brocco (бесплатный)
│   │   ├── carrot.png        # Carrie (3 монеты)
│   │   ├── apple.png         # Appy (6 монет)
│   │   ├── blueberry.png     # Blubby (12 монет)
│   │   └── strawberry.png    # Berry (20 монет)
│   ├── screen/
│   │   └── splash-hero.png   # Иллюстрация на стартовом экране
│   └── sw.js                 # Service Worker для Web Push
│
├── src/
│   ├── app/
│   │   ├── layout.tsx                    # Root layout (шрифты, провайдеры)
│   │   ├── page.tsx                      # Стартовый экран (/)
│   │   ├── providers.tsx                 # Все Context Providers
│   │   ├── globals.css                   # Tailwind + CSS-переменные
│   │   ├── (child)/                      # Route group — детский интерфейс
│   │   │   ├── layout.tsx                # Guard: редирект на /setup если нет профиля
│   │   │   ├── setup/page.tsx            # Онбординг: имя + выбор mascot
│   │   │   ├── home/page.tsx             # Главная: баланс монет + карточки разделов
│   │   │   ├── menu/page.tsx             # Меню блюд с фильтрами по категориям
│   │   │   ├── cart/page.tsx             # Корзина + оформление заказа
│   │   │   ├── orders/page.tsx           # Мои заказы (статусы)
│   │   │   ├── history/page.tsx          # История всех заказов
│   │   │   ├── buddies/page.tsx          # Магазин mascot-персонажей
│   │   │   └── reports/page.tsx          # Отчёт о питании
│   │   ├── (parent)/                     # Route group — панель родителя
│   │   │   ├── layout.tsx                # Guard: редирект на /login если нет auth
│   │   │   ├── login/page.tsx            # PIN-вход (код: 1234)
│   │   │   ├── dashboard/page.tsx        # Заказы + кнопки статусов
│   │   │   ├── menu-manager/
│   │   │   │   ├── page.tsx              # Список блюд
│   │   │   │   ├── new/page.tsx          # Добавить блюдо
│   │   │   │   └── [id]/page.tsx         # Редактировать блюдо
│   │   │   ├── categories/page.tsx       # Управление категориями
│   │   │   ├── ingredients/page.tsx      # Нежелательные ингредиенты
│   │   │   ├── notifications/page.tsx    # Настройка напоминаний
│   │   └── api/
│   │       ├── analyze-dish/route.ts     # POST: AI-анализ фото блюда
│   │       ├── push/
│   │       │   ├── subscribe/route.ts    # POST/DELETE: подписка на push
│   │       │   ├── send/route.ts         # POST: отправить push вручную
│   │       │   └── schedules/route.ts    # GET/POST/DELETE: расписания
│   │       └── cron/reminders/route.ts   # GET: Vercel Cron (каждую минуту)
│   │
│   ├── components/
│   │   ├── admin/
│   │   │   ├── AdminNav.tsx              # Верхняя панель родительского режима
│   │   │   └── DishForm.tsx              # Форма добавления/редактирования блюда
│   │   ├── layout/
│   │   │   ├── ChildNav.tsx              # Верхняя панель детского режима
│   │   │   └── ProfileSwitcher.tsx       # Дропдаун выбора профиля ребёнка
│   │   ├── mascot/
│   │   │   ├── Mascot.tsx                # Анимированный mascot-персонаж
│   │   │   ├── SpeechBubble.tsx          # Облачко с текстом
│   │   │   └── mascotData.ts             # Конфиги mascot + стоимости разблокировки
│   │   ├── menu/
│   │   │   └── DishCard.tsx              # Карточка блюда с монеткой и кнопкой
│   │   ├── notifications/
│   │   │   ├── NotificationsPrompt.tsx   # Запрос разрешения на push
│   │   │   ├── OrderPlacedListener.tsx   # Слушает заказы → push родителю
│   │   │   └── ReminderOverlay.tsx       # Полноэкранный оверлей напоминания
│   │   ├── cart/
│   │   │   ├── CartButton.tsx            # Кнопка корзины с бейджем
│   │   │   └── CartItemThumb.tsx         # Превью блюда в корзине
│   │   └── ui/
│   │       ├── Button.tsx                # Базовая кнопка
│   │       ├── GoldCoin.tsx              # Иконка монеты (coin1.png)
│   │       ├── LanguageSwitcher.tsx      # EN/RU переключатель
│   │       └── NavCard.tsx               # Карточка-ссылка на главной
│   │
│   ├── context/
│   │   ├── CartContext.tsx               # Корзина (Supabase + localStorage)
│   │   ├── ChildProfileContext.tsx       # Профиль ребёнка (монеты, mascot)
│   │   ├── LanguageContext.tsx           # Текущий язык + функция t()
│   │   ├── MenuContext.tsx               # Список блюд из Supabase
│   │   └── OrdersContext.tsx             # Заказы из Supabase
│   │
│   ├── hooks/
│   │   ├── useAdminAuth.ts               # Проверка PIN-авторизации
│   │   ├── useChildProfile.ts            # Shortcut к ChildProfileContext
│   │   ├── useCustomCategories.ts        # Пользовательские категории
│   │   ├── usePushSubscription.ts        # Регистрация SW + подписка на push
│   │   └── useSpeechSynthesisPrimer.ts   # Прогрев Web Speech API
│   │
│   ├── lib/
│   │   ├── adminAuth.ts                  # PIN-авторизация (localStorage)
│   │   ├── childProfile.ts               # CRUD профилей (localStorage)
│   │   ├── motivation.ts                 # Фразы mascot при заказе
│   │   ├── sound.ts                      # Web Audio API — джингл
│   │   ├── image.ts                      # Хелперы для работы с изображениями
│   │   ├── ai/analyzeDish.ts             # Клиент для /api/analyze-dish
│   │   ├── push/
│   │   │   ├── client.ts                 # Подписка на push (браузер)
│   │   │   └── server.ts                 # Отправка push (сервер, web-push)
│   │   ├── supabase/
│   │   │   ├── client.ts                 # Supabase клиент
│   │   │   ├── mappers.ts                # Конвертация DB rows ↔ TypeScript типы
│   │   │   └── storage.ts                # Загрузка фото в Supabase Storage
│   │   └── i18n/
│   │       └── translations.ts           # Все переводы EN + RU
│   │
│   ├── data/
│   │   └── dishes.ts                     # TypeScript типы Dish, DishCategory
│   │
│   └── types/
│       └── web-push.d.ts                 # Декларации типов для web-push
```

---

## 4. База данных (Supabase)

### 4.1 Таблица `dishes`

```sql
create table dishes (
  id           uuid primary key default gen_random_uuid(),
  category     text not null,
  name         text not null,
  name_ru      text default '',
  mascot_tip   text default '',
  mascot_tip_ru text default '',
  emoji        text default '🍽️',
  prep_time    integer default 10,
  calories     integer default 0,
  protein      integer default 0,
  fat          integer default 0,
  carbs        integer default 0,
  fun_fact     text default '',
  image_url    text,
  is_available boolean default true,
  coin_value   integer,          -- null = авто по категории
  ingredients  text[] default '{}',
  created_at   timestamptz default now()
);
```

**Категории** (поле `category`): `Breakfast`, `Main`, `Sides`, `Desserts`, `Drinks`, `Fruits`, `Snacks`

**Монеты по умолчанию** (если `coin_value` null):

| Категория | Монет |
|---|---|
| Breakfast | 2 |
| Main | 3 |
| Sides | 1 |
| Desserts | 1 |
| Drinks | 1 |
| Fruits | 2 |
| Snacks | 5 (стоимость, не заработок) |

### 4.2 Таблица `orders`

```sql
create table orders (
  id             uuid primary key default gen_random_uuid(),
  child_name     text not null,
  status         text not null default 'preparing',
  items          jsonb not null default '[]',
  mascot_message text default '',
  created_at     timestamptz default now(),
  updated_at     timestamptz default now()
);
```

**Статусы:** `preparing` → `ready` → `completed` | `cancelled`

**Структура `items` (jsonb):**
```json
[{
  "dishId": "uuid",
  "name": "Pasta",
  "emoji": "🍝",
  "portion": "whole",
  "quantity": 1,
  "coinValue": 3,
  "isSnack": false
}]
```

### 4.3 Таблица `carts`

```sql
create table carts (
  device_id  text primary key,
  items      jsonb not null default '[]',
  updated_at timestamptz default now()
);
```

Каждое устройство идентифицируется через `crypto.randomUUID()`, сохранённый в localStorage.

### 4.4 Таблица `push_subscriptions`

```sql
create table push_subscriptions (
  id         uuid primary key default gen_random_uuid(),
  endpoint   text not null unique,
  p256dh     text not null,
  auth       text not null,
  role       text not null,      -- 'child' | 'parent'
  created_at timestamptz default now()
);
```

### 4.5 Таблица `notification_schedules`

```sql
create table notification_schedules (
  id           uuid primary key default gen_random_uuid(),
  label        text not null,
  cron         text not null,    -- "30 12 * * *" = каждый день в 12:30
  message      text not null,
  is_active    boolean default true,
  last_sent_at timestamptz,
  created_at   timestamptz default now()
);
```

### 4.6 Таблица `unavailable_ingredients`

```sql
create table unavailable_ingredients (
  id          uuid primary key default gen_random_uuid(),
  name        text not null unique,
  created_at  timestamptz default now()
);
```

### 4.7 Supabase Storage

Бакет `dish-photos` (публичный) — хранит фотографии блюд. Загружается через `src/lib/supabase/storage.ts`.

---

## 5. Переменные окружения

Файл `.env.local` (и Vercel Environment Variables):

```env
# Supabase
NEXT_PUBLIC_SUPABASE_URL=https://xxxx.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=eyJ...

# Anthropic (AI-анализ фото)
ANTHROPIC_API_KEY=sk-ant-...

# Web Push (VAPID)
NEXT_PUBLIC_VAPID_PUBLIC_KEY=BNxxxxxxxxxxxxxxxx
VAPID_PRIVATE_KEY=xxxxxxxxxxxxxxxx
VAPID_SUBJECT=mailto:your@email.com
```

**Генерация VAPID ключей:**
```bash
npx web-push generate-vapid-keys
```

**Vercel Cron** (файл `vercel.json`):
```json
{
  "crons": [{
    "path": "/api/cron/reminders",
    "schedule": "* * * * *"
  }]
}
```

---

## 6. Дизайн-система

### 6.1 Цвета (Tailwind)

```js
feather: { DEFAULT: "#58CC02" }  // зелёный — primary
macaw:   { DEFAULT: "#1CB0F6" }  // голубой — вторичный
bee:     { DEFAULT: "#FFC800" }  // жёлтый — монеты
fox:     { DEFAULT: "#FF9600" }  // оранжевый
cardinal:{ DEFAULT: "#FF4B4B" }  // красный — ошибки/отмена
beetle:  { DEFAULT: "#CE82FF" }  // фиолетовый
eel:     { DEFAULT: "#4B4B4B" }  // тёмный текст
cloud:   "#F7F7F7"               // фон страниц
snow:    "#FFFFFF"
```

### 6.2 Шрифты

```tsx
// layout.tsx
import { Baloo_2, Nunito } from "next/font/google";

const baloo = Baloo_2({ subsets: ["latin"], weight: ["500","600","700","800"], variable: "--font-baloo" });
const nunito = Nunito({ subsets: ["latin"], weight: ["400","600","700","800"], variable: "--font-nunito" });
```

- **Заголовки** (`font-heading`): Baloo 2 — круглый, игривый
- **Текст** (`font-body`): Nunito — читаемый, дружелюбный

### 6.3 Кнопки (Duolingo-стиль)

```css
/* globals.css */
.btn-press {
  transition: transform 0.08s ease, box-shadow 0.08s ease;
}
.btn-press:active {
  transform: translateY(4px);
  box-shadow: none !important;
}
```

```js
// tailwind.config.ts
boxShadow: {
  duo: "0 4px 0 0 var(--tw-shadow-color)",
  "duo-sm": "0 2px 0 0 var(--tw-shadow-color)",
  card: "0 4px 12px rgba(0,0,0,0.06)",
}
```

### 6.4 UI-константы навбаров

```tsx
// Квадратные кнопки 44×44px
const SQ = "flex h-11 w-11 shrink-0 items-center justify-center rounded-[14px]";

// Цвета AdminNav
const ACTIVE = "bg-[#eef7e3] text-[#3c9500]";
const INACTIVE = "text-[#5a6150] hover:bg-[#f6f8f2]";

// Граница навбара
"border-b-2 border-[#eef0ea]"
```

---

## 7. Система аутентификации

### Детский режим
Хранится в `localStorage` (`goodfood:child-profile`). При открытии любой детской страницы без профиля — редирект на `/setup`.

### Родительский режим
PIN-код `1234`, хранится в `localStorage` (`goodfood:admin-auth: "true"`).

> **Важно:** В будущем нужно заменить обе системы на Supabase Auth.

---

## 8. Система монет

**Логика:**

- Здоровые блюда (все категории кроме `Snacks`) → ребёнок **зарабатывает** монеты при оформлении заказа
- `Snacks` → ребёнок **тратит** монеты при добавлении в корзину (списывается сразу)
- Монеты тратятся на разблокировку mascot-персонажей (`/buddies`)
- При отмене заказа родителем → монеты за снеки **возвращаются**

**Стоимость mascot-персонажей:**

| Mascot | ID | Монет |
|---|---|---|
| Brocco | broccoli | 0 (бесплатный) |
| Carrie | carrot | 3 |
| Appy | apple | 6 |
| Blubby | blueberry | 12 |
| Berry | strawberry | 20 |

---

## 9. Система push-уведомлений

**Архитектура:**

1. Браузер регистрирует Service Worker (`/sw.js`)
2. `usePushSubscription` запрашивает разрешение и отправляет subscription на `/api/push/subscribe`
3. Supabase хранит subscription с ролью (`child` | `parent`)
4. Родитель настраивает расписания в `/notifications`
5. Vercel Cron каждую минуту вызывает `/api/cron/reminders` → находит активные расписания → отправляет push через `web-push`
6. Когда ребёнок оформляет заказ → `OrderPlacedListener` вызывает `/api/push/send` → родителю приходит push

**Два вида уведомлений:**
- `reminder` — напоминание ребёнку заказать еду (показывает полноэкранный оверлей + джингл)
- `order_placed` — уведомление родителю о новом заказе

---

## 10. AI-анализ фото блюд

**Endpoint:** `POST /api/analyze-dish`

**Запрос:**
```json
{ "imageDataUrl": "data:image/jpeg;base64,..." }
```

**Ответ:**
```json
{
  "name": "Veggie Power Pasta",
  "nameRu": "Паста с овощами",
  "mascotTip": "Pasta gives you energy to run super fast! 🍝",
  "mascotTipRu": "Паста даёт энергию бегать быстро! 🍝",
  "calories": 380,
  "protein": 12,
  "fat": 8,
  "carbs": 62,
  "funFact": "Pasta was invented in Italy over 700 years ago! 🇮🇹",
  "ingredients": ["pasta", "tomato", "cheese", "basil"]
}
```

**Модель:** `claude-haiku-4-5-20251001` (настраивается через `ANTHROPIC_MODEL`)

---

## 11. Маршруты (Routes)

| URL | Описание | Режим |
|---|---|---|
| `/` | Стартовый экран | Публичный |
| `/setup` | Онбординг: имя + mascot | Детский |
| `/home` | Главная страница | Детский |
| `/menu` | Меню блюд | Детский |
| `/cart` | Корзина | Детский |
| `/orders` | Мои заказы | Детский |
| `/history` | История заказов | Детский |
| `/buddies` | Магазин mascot | Детский |
| `/reports` | Отчёт о питании | Детский |
| `/login` | PIN-вход для родителя | Публичный |
| `/dashboard` | Заказы (управление) | Родитель |
| `/menu-manager` | Список блюд | Родитель |
| `/menu-manager/new` | Добавить блюдо | Родитель |
| `/menu-manager/[id]` | Редактировать блюдо | Родитель |
| `/categories` | Категории | Родитель |
| `/ingredients` | Нежелательные ингредиенты | Родитель |
| `/notifications` | Push-напоминания | Родитель |

---

## 12. Многопрофильность

На одном устройстве может быть несколько детских профилей (братья/сёстры).

```ts
// localStorage keys
"goodfood:child-profile"   // активный профиль
"goodfood:child-profiles"  // массив всех сохранённых профилей
"goodfood:device-id"       // UUID устройства для корзины
"goodfood:admin-auth"      // "true" если залогинен родитель
```

`ProfileSwitcher` в `ChildNav` — дропдаун для смены профиля без перезахода.

---

## 13. Интернационализация (i18n)

Два языка: **EN** и **RU**. Переключатель в обоих навбарах.

```tsx
// Использование
const { t, lang } = useLanguage();
t("menu.title")                         // "Yummy Menu" / "Вкусное меню"
t("home.greeting", { name: "Masha" })  // "Hi Masha! ..." / "Привет, Masha! ..."
```

Все строки в `src/lib/i18n/translations.ts`.

---

## 14. Установка и запуск

```bash
# 1. Клонировать и установить зависимости
git clone <repo>
cd goodfood
npm install

# 2. Создать .env.local (см. раздел 5)

# 3. Создать таблицы в Supabase (см. раздел 4)

# 4. Запустить локально
npm run dev
# → http://localhost:3000

# 5. Сборка
npm run build
npm start
```

---

## 15. Деплой на Vercel

1. Подключить GitHub репозиторий в Vercel
2. Добавить все переменные окружения (раздел 5)
3. В `vercel.json` настроить Cron Job для напоминаний
4. В Supabase Storage создать публичный bucket `dish-photos`
5. Настроить CORS в Supabase (разрешить домен Vercel)

---

## 16. Ключевые зависимости

```json
{
  "next": "^16.2.9",
  "react": "^19.0.0",
  "framer-motion": "^11.18.2",
  "@supabase/supabase-js": "^2.49.4",
  "@supabase/ssr": "^0.5.2",
  "web-push": "^3.6.7",
  "tailwindcss": "^3.4.17",
  "typescript": "^5.7.3"
}
```

---

## 17. Что можно улучшить (TODO)

- Заменить PIN-авторизацию на Supabase Auth (email/password или magic link)
- Перенести профили детей из localStorage в Supabase (для синхронизации между устройствами)
- Добавить фильтрацию меню по нежелательным ингредиентам (таблица создана, логика ещё не подключена)
- Добавить поле ингредиентов в форму блюда (таблица создана)
- PWA: добавить `manifest.json` и иконки для установки на домашний экран
- Аналитика: отчёты о питании ребёнка за период
