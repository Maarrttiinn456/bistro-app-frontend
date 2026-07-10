# Bistro frontend - AGENTS.md

Expo + React Native aplikace pro bistro appku.

Tenhle soubor je rychla mapa projektu. Projekt si chci stavet sam s pomoci agenta, ne aby agent generoval celou architekturu dopredu.

Detailni pravidla jsou v `.agents/rules/`:

- `.agents/rules/workflow.md` - jak agent pracuje a kdy potrebuje potvrzeni.
- `.agents/rules/project-structure.md` - kam patri `app/`, `src/api/`, `src/auth/` a `src/query/`.
- `.agents/rules/backend-api.md` - backend, OpenAPI, Orval a generovane typy.
- `.agents/rules/coding-style.md` - TypeScript a styl kodu.

## Jak nad projektem premyslet

- `app/` = stranky, layouty a navigace.
- `src/` = pomocny kod mimo stranky, az kdyz zacne byt potreba.
- `assets/` = obrazky a staticke soubory.

## Technologie

- Expo SDK 54
- React Native
- Expo Router
- TypeScript
- TanStack Query pro loading/cache/error stav kolem dat
- Orval pro generovani API klienta a typu z OpenAPI
- Fastify backend jako jediny server, ktery frontend vola

## Zasadni pravidla

- Komunikuj cesky, pokud uzivatel nepise anglicky.
- Delej jen to, co uzivatel zadal.
- U vetsich zmen nejdriv napis kratky plan.
- Pomahas po malych krocich. Negeneruj celou appku, pokud o to vyslovne nepozadam.
- Frontend nikdy nevola Supabase primo.
- Nevratne akce, napr. delete, force push, send nebo publish, vyzaduji explicitni potvrzeni.
- Pri reseni startu nebo prihlaseni vzdy zkontroluj aktualni IPv4 adresu stroje a porovnej ji s `EXPO_PUBLIC_API_URL` v `.env.local`. Pokud nesedi, upozorni uzivatele a navrhni/uprav spravnou hodnotu.

## Kde co hledat

```text
app/
  _layout.tsx              # root layout a navigace
  index.tsx                # uvodni route

src/                       # pomocny kod mimo stranky, az kdyz je potreba
assets/                    # obrazky a staticke soubory
```

## Dev prikazy

Pred startem na mobilu zkontroluj, ze `EXPO_PUBLIC_API_URL` miri na aktualni IPv4 adresu pocitace v dane siti, napr. `http://10.217.113.48:3000`. Po zmene `.env.local` restartuj Expo s vycistenou cache.

```bash
npm run start
npx expo start -c
npm run android
npm run ios
npm run web
npm run lint
```
