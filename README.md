# GoodFood 🥦🍎

A Duolingo-style web app that helps kids (6–15) and parents build healthy eating
habits — built with Next.js 15 (App Router), TypeScript, Tailwind CSS, Framer
Motion, and Supabase.

---

## Running it locally

1. **Install dependencies**

   ```bash
   npm install
   ```

2. **Set up environment variables**

   Copy the example file and fill in your own values:

   ```bash
   cp .env.local.example .env.local
   ```

   ```
   NEXT_PUBLIC_SUPABASE_URL=your-project-url.supabase.co
   NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key
   ANTHROPIC_API_KEY=your-key-here
   ```

   Note: the app currently runs entirely on `localStorage` (see "Current state"
   below), so it works without the Supabase variables filled in — they're
   placeholders for the planned Supabase integration.

   `ANTHROPIC_API_KEY` powers the real AI dish-photo analysis in the admin
   "Add/Edit dish" form (see below). Without it, photo uploads still work but
   fall back to a small local simulation with placeholder nutrition numbers.
   Get a key at [console.anthropic.com](https://console.anthropic.com/), and
   never commit `.env.local` (it's already gitignored).

3. **Run the dev server**

   ```bash
   npm run dev
   ```

   Open [http://localhost:3000](http://localhost:3000).

4. **Build for production**

   ```bash
   npm run build
   npm start
   ```

5. **Lint**

   ```bash
   npm run lint
   ```

> This project was developed in a sandbox without npm registry access, so
> `npm install` / `npm run build` / `npm run lint` could not be run there.
> Everything was reviewed manually for TypeScript correctness, but please run
> `npm install && npm run build` and `npm run lint` locally as a first step to
> catch anything the sandbox couldn't.

---

## Current state of the project

### Child app (kid-facing, bright & playful)

- **Landing page** (`/`) — intro screen with mascot, CTA, language switcher.
- **Setup** (`/setup`) — child enters their name and picks a mascot buddy
  (broccoli, carrot, etc.), saved to `localStorage`.
- **Home** (`/home`) — greeting from the mascot + nav cards to Menu, My
  Orders, History, Reports, plus a link into Parent Mode.
- **Menu** (`/menu`) — browseable dish catalog with category filter chips,
  dish cards showing photo/emoji, prep time, calories, portion picker
  (whole/half), and "Add to Cart".
- **Cart** (`/cart`) — review items, remove items, see a live AI-style
  motivational message from the mascot, and place an order.
- **Orders** (`/orders`) — list of placed orders with status badges
  (received → preparing → ready → etc.).
- **History** and **Reports** — placeholder "coming soon" screens, ready for
  future features (eating history, nutrition reports).
- **Mascot system** — animated mascot (Framer Motion) with emotion states
  (idle, happy, excited, surprised, thinking, cheering), speech bubbles, and a
  tap-to-react interaction that triggers a cheering animation + random phrase.
- **Floating cart button** visible across child pages.

### Parent / admin app (`/login`, `/dashboard`, `/menu-manager`, clean &
friendly but more "grown-up")

- **Login** (`/login`) — simple PIN gate (`1234` placeholder, see
  `src/lib/adminAuth.ts`), to be replaced with real Supabase Auth.
- **Dashboard** (`/dashboard`) — live list of orders with status controls
  (advance status / cancel).
- **Menu Manager** (`/menu-manager`) — add, edit, and delete dishes, grouped
  by category.
- **Dish form** — upload a photo to get a real Claude Vision analysis
  (`src/lib/ai/analyzeDish.ts` calls the `/api/analyze-dish` server route,
  which needs `ANTHROPIC_API_KEY`): suggests the dish name (EN + RU), a
  mascot tip (EN + RU), and nutrition (calories/protein/fat/carbs/fun fact).
  All fields stay manually editable, and only empty fields get auto-filled —
  if the key isn't set or the call fails, it falls back to a local
  randomized placeholder so the form still works.

### Internationalization (English / Russian)

- Full UI translation via `src/lib/i18n/translations.ts` — dotted-key
  dictionaries for `en` and `ru`, accessed through `useLanguage()` → `t(key,
  vars?)` with `{placeholder}` interpolation.
- `LanguageSwitcher` component (flag + EN/RU pill toggle) on all entry-point
  screens (landing, setup, home, admin login, admin nav).
- Russian pluralization handled via `pluralRu(n, one, few, many)` for counts
  like "X dishes" / "X блюд".
- Dish names/tips and mascot phrases are translated per-language via
  `getDishName`, `getDishTip`, `getEmotionPhrases`.
- Language preference persists in `localStorage` and syncs `<html lang="">`
  for accessibility/SEO.

### Data & state

Everything currently persists to `localStorage` (no backend yet):

| Key | Stores |
|---|---|
| `goodfood:cart` | Current cart contents |
| `goodfood:orders` | Placed orders & statuses |
| `goodfood:menu` | Editable dish catalog (seeded from `src/data/dishes.ts`) |
| `goodfood:child-profile` | Child's name + chosen mascot |
| `goodfood:admin-auth` | Parent/admin login state |
| `goodfood:lang` | Language preference (`en`/`ru`) |

All contexts (`CartContext`, `OrdersContext`, `MenuContext`,
`LanguageContext`) are combined in `src/app/providers.tsx`.

### Design system

- Custom Duolingo-inspired Tailwind palette: `feather` (green), `macaw`
  (blue), `bee` (yellow), `fox` (orange), `cardinal` (red), `beetle` (purple),
  `eel`/`eel-light` (text), `cloud`/`wolf`/`snow` (grays/white).
- Fonts: **Baloo 2** for headings, **Nunito** for body text.
- Shared `btn-press` micro-interaction class and `shadow-duo*` /
  `shadow-{color}-{shade}` shadow utilities.
- Responsive layouts reviewed across the app (e.g. dish form grids stack
  correctly on mobile).

### Known placeholders / next steps

- **Supabase**: env vars are wired up but the app doesn't talk to Supabase
  yet — `localStorage` stands in for the database and `adminAuth.ts` stands in
  for Supabase Auth.
- **AI dish analysis**: `analyzeDishPhoto()` now calls Claude Vision via
  `/api/analyze-dish` (set `ANTHROPIC_API_KEY` in `.env.local`); falls back to
  a randomized local simulation if the key is missing or the call fails.
- **History & Reports**: placeholder screens for future eating-history and
  nutrition-report features.

---

## Project structure (high level)

```
src/
  app/
    (child)/        # kid-facing routes: setup, home, menu, cart, orders, history, reports
    (parent)/       # admin routes: login, dashboard, menu-manager
    layout.tsx       # root layout (fonts, providers)
    providers.tsx    # combines Language/Menu/Cart/Orders contexts
  components/
    mascot/          # Mascot, SpeechBubble, mascot data & emotions
    menu/            # DishCard
    admin/           # AdminNav, DishForm
    ui/              # Button, NavCard, LanguageSwitcher
    cart/            # CartButton
  context/           # CartContext, OrdersContext, MenuContext, LanguageContext
  data/              # dishes.ts (seed data)
  hooks/             # useChildProfile, useAdminAuth
  lib/
    i18n/            # translations.ts
    ai/              # analyzeDish.ts (calls /api/analyze-dish, with local fallback)
    motivation.ts    # AI-style motivational messages
    adminAuth.ts, childProfile.ts
  app/
    api/analyze-dish/route.ts  # server route calling Claude Vision (ANTHROPIC_API_KEY)
```
