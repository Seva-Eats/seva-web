# Seva Eats Web — Agent Context

This file guides AI agents building UI and flows in **seva-eats-web**. The web app mirrors the Expo app in **sewa-eats** (same product, shared tokens). Read this before changing screens, components, or styles.

## Planning docs (read for new features)

| Doc | Use when |
|-----|----------|
| [context.md](./context.md) | What exists today, schema map, repo links |
| [docs/ROADMAP.md](./docs/ROADMAP.md) | **What to build next** — phased tasks + exit criteria |
| [docs/ROUTING.md](./docs/ROUTING.md) | Dispatch, VRP, `driver_routes`, matrix API, live tracking |
| `.agents/skills/seva-routing/SKILL.md` | Short routing rules for agents |

Build **one phase at a time** per ROADMAP. Do not implement WhatsApp or full VRP before Phase 0–1 SQL wiring is done.

## Product

- **Mission**: Free langar meals for people in need, delivered with dignity; volunteers power pickup and drop-off.
- **Tone**: Warm, respectful, barrier-free — never clinical, corporate, or “startup SaaS purple.”
- **Primary accent**: Orange `#F07B2A` (onboarding) / `#F97316` (app shell). Use consistently for CTAs, icons, and selection states.

## Design tokens (source of truth)

| Token | Location | Notes |
|-------|----------|--------|
| Colors (light/dark) | `constants/theme.ts` | `background` `#FFF8F0`, `accent`, `mutedText`, borders |
| Onboarding | `constants/onboarding.ts` | `ONBOARDING_COLORS`, `ONBOARDING_TOKENS` (padding, radii, title sizes) |
| Typography classes | `app/typography.css`, `constants/typography.ts` | Use `TypeClass.*` — **do not** invent random `text-sm font-bold` |
| Spacing / radii | `constants/theme.ts` → `Spacing`, `Radii` | Match Expo: cards `Radii.lg` (20), pills `ctaRadius` 28 |

### Typography rules

- **Font**: SF Pro stack via `font-sans` on `body` — see `app/layout.tsx` and `app/globals.css`.
- **Weights**: Expo uses numeric weights — `500` body, `600` labels/headers (17px), `700` section titles, `800` onboarding headlines. Map via `TypeClass`, not Tailwind guesses.
- **Never** use serif/notebook styling on standard flows; onboarding role selection uses the same sans + card pattern as slide 1.

### Layout

- **Mobile-first**: Content lives in `AppShell` (`max-w-[430px]` centered). Full-bleed desktop background is cream `#FAF3EB` / `#FFF8F0`.
- **Padding**: Onboarding screens use `ONBOARDING_TOKENS.horizontalPadding` (24px).

## UI patterns (reuse these)

### Onboarding

- **Nav row**: `BackNavButton` + `ProgressDots` + optional Skip (`TypeClass.onboardSkip`).
- **Badge**: Peach pill `bg-[#FFE8D4]`, `TypeClass.onboardBadge`, uppercase label (e.g. `YOUR PATH`, `DID YOU KNOW`).
- **Headline**: `TypeClass.onboardHeadline`, centered when appropriate.
- **Subtext**: `TypeClass.onboardSubtext`, `#5E646C` or `#6B7280`.
- **Primary CTA**: Orange pill, height ~48–56, `TypeClass.onboardCta`, soft orange shadow.
- **Role selection**: `RoleChoiceCard` in `components/onboarding/RoleChoiceCard.tsx` — white card, icon circle, tag pill, chevron — **not** ruled notebook / serif list.

### Authenticated request flow

- **Header**: `RequestFlowHeader` — 17px/600 title, 12px subtitle, profile link.
- **Info banner**: Peach `bg-[#FFF2E6]` / `#FFF7ED`, icon left, `TypeClass.label` title.
- **Cards**: White, `border-[#E8E3DA]`, `rounded-2xl`, light shadow.
- **Selection**: Orange border + orange controls when selected; green `AVAILABLE` micro badge on hubs.
- **Sticky footer**: White bar, meal count badge + orange Continue pill.

### Profile & forms

- **Section title**: `TypeClass.profileSection` (20px/700).
- **Inputs**: `type-body-md`, rounded-xl, border `#E8E3DA`, focus `#F07B2A`.
- **Account card**: White bordered card, avatar circle orange, meta labels `TypeClass.metaLabel`.

### Tracking

- **Progress**: `DeliveryProgressStepper` — 4 steps, orange active, green complete.
- **Details**: `RequestDetailsCard` — label/value rows with icons.

## Component map

```
components/
  AppShell.tsx          # 430px column
  onboarding/           # BackNavButton, ProgressDots, RoleChoiceCard
  request/RequestFlowHeader.tsx
  meals/MealGridCard.tsx, MealIcon.tsx
  tracking/             # DeliveryProgressStepper, RequestDetailsCard
  PageHeader.tsx        # 18px/700 for profile-style pages
```

## User roles

- `recipient` — meal request flow (`/request/location` → meals → details → tracking). Profile: `/profile`.
- `dasher` — volunteer (sevadar); set via onboarding slide 2. Home: `/seva` (active route + stops). Profile: `/seva/profile` (vehicle, notifications, role switch — not serving size / home address).
- Role routing: `lib/navigation/role-paths.ts` + `AuthGate` (volunteers cannot access `/request/*`; recipients cannot access `/seva/*`).
- Post-auth redirect uses stored role from `user-profile` localStorage.

## Do

- Match **sewa-eats** screen styles when porting (grep `StyleSheet.create` in `sewa-eats/app/`).
- Use `lucide-react` icons with stroke ~1.75–2, orange `#F07B2A` on onboarding.
- Use `framer-motion` for subtle entrance on onboarding (opacity + y, spring).
- Keep copy short, dignified, and plain language.
- Use existing context (`UserContext`, `RequestContext`, `LocationContext`) — no duplicate state.

## Agent workflow (defaults)

- **Do not** run `npm run build` after every change. Run it only when the user asks, when CI is failing, or when you changed build/config/types in ways that clearly need a full compile check.
- **Do not** `git push`, open PRs, or create commits unless the user explicitly asks. Local edits only unless they request git operations.
- Prefer quick checks (`read_lints` on touched files) over full production builds for routine UI work.

## Don't

- Don't introduce Inter, Roboto, or generic “AI dashboard” aesthetics.
- Don't use heavy gradients, glassmorphism, or dark purple palettes.
- Don't use serif/editorial layouts for in-app flows.
- Don't replace `TypeClass` with ad-hoc Tailwind font sizes on new screens.
- Don't break `AppShell` max-width or onboarding cookie/middleware flow.

## Reference implementation

When unsure, compare:

1. Expo: `/Users/AdvayChandorkar/Downloads/SevaEats/sewa-eats/app/`
2. Web onboarding slide 1: `app/onboarding/slide1/page.tsx`
3. Web role slide: `app/onboarding/slide2/page.tsx` + `RoleChoiceCard`
4. Web meals: `app/request/new/page.tsx`