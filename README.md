# Seva Eats Web

Next.js web app with full parity to the Expo mobile app (`sewa-eats`): Supabase auth, local meal-request simulation, and the same user flows.

## Setup

1. Copy environment variables (same Supabase project as mobile):

```bash
cp .env.example .env.local
```

Set `NEXT_PUBLIC_SUPABASE_URL` and `NEXT_PUBLIC_SUPABASE_ANON_KEY` (or keep existing `EXPO_PUBLIC_*` names — both are supported).

2. In **Supabase Dashboard → Authentication → URL configuration**, add:

- `http://localhost:3000/auth/callback`
- Your production URL + `/auth/callback`

3. Install and run:

```bash
npm install
npm run dev
```

Open [http://localhost:3000](http://localhost:3000).

## Routes

| Path | Purpose |
|------|---------|
| `/onboarding` | Welcome |
| `/onboarding/slide1`–`slide3` | Onboarding slides |
| `/onboarding/sign-in` | Google, Apple, email, guest |
| `/onboarding/email` | Email/password |
| `/onboarding/verify` | OTP verification |
| `/auth/callback` | OAuth / magic-link callback |
| `/request/location` | Pickup hub |
| `/request/new` | Meal selection |
| `/request/details` | Submit request |
| `/request/[id]` | Tracking |
| `/requests/active`, `/requests/history` | Request lists |
| `/profile`, `/locations`, `/support` | Account & help |
