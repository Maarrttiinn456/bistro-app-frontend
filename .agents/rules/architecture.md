# Architektonická pravidla

## Základ

- Expo Router je routing vrstva.
- TanStack Query je data layer.
- Orval generuje API klienta, API typy a TanStack Query hooky z OpenAPI.
- `app/` slouží hlavně pro routing, layouty a skládání obrazovek.
- Business logika patří do `src/features`, `src/auth` nebo `src/api`.
- Sdílené komponenty připravuj v `src/components`, ale nerozbíjej UI do mnoha abstrakcí předčasně.

## Zdroj pravdy

- Backend repo `Maarrttiinn456/bistro-app-backend` je hlavní zdroj pravdy pro API a domény.
- Pokud se liší Notion a backend repo, řiď se backend repem.
- Pokud se liší lokální frontend dokumentace a aktuální OpenAPI backendu, nejdřív ověř backend repo a teprve potom uprav frontend.

## Domény

Frontend strukturuj podle backend domén:

- `auth`
- `profile`
- `ingredients`
- `recipes`
- `meal-plan`
- `food-log`
- `overview/dashboard`

## Omezení

- Frontend nesmí volat Supabase přímo.
- Frontend nesmí obsahovat Supabase URL, anon key ani `@supabase/supabase-js`.
- Veškerá komunikace jde přes Fastify backend.
- Architekturu neměň bez potvrzení.
