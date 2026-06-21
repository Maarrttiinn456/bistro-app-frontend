# Bistro frontend - AGENTS.md

Expo + React Native aplikace pro bistro appku.

Tenhle soubor ma byt jednoducha mapa projektu. Projekt si chci stavet sam s pomoci agenta, ne aby agent generoval celou architekturu dopredu.

## Jak nad projektem premyslet

- `app/` = stranky, layouty a navigace.
- `src/` = pomocny kod mimo stranky, az kdyz zacne byt potreba.
- `assets/` = obrazky a staticke soubory.

Jinak receno:

- Kdyz resis obrazovku nebo route, zacni v `app/`.
- Kdyz resis data, API nebo sdilenou logiku, zacni v `src/`.
- Kdyz neco neni potreba sdilet, nech to co nejbliz u obrazovky.

## Technologie

- Expo SDK 54
- React Native
- Expo Router
- TypeScript
- TanStack Query pro loading/cache/error stav kolem dat
- Orval pro generovani API klienta a typu z OpenAPI
- Fastify backend jako jediny server, ktery frontend vola

## Nejdulezitejsi pravidla

- Komunikuj cesky, pokud uzivatel nepise anglicky.
- Delej jen to, co uzivatel zadal.
- U vetsich zmen nejdriv napis kratky plan.
- Nemen architekturu bez potvrzeni.
- Nezakladej slozky dopredu.
- Vysvetluj jednoduse, proc neco patri do dane slozky.
- Pomahas po malych krocich. Negeneruj celou appku, pokud o to vyslovne nepozadam.
- Frontend nikdy nevola Supabase primo.
- Nevratne akce, napr. delete, force push, send nebo publish, vyzaduji explicitni potvrzeni.

## Backend, API a typy

Pravda o backendu je v backend repu:

```text
Maarrttiinn456/bistro-app-backend
```

Pravda o API ma jit z backend OpenAPI vystupu.

Zjednoduseny tok:

```text
backend schema
  -> OpenAPI JSON
  -> Orval
  -> generovane typy a fetch funkce
  -> funkce/hooky pro fetch dat
  -> obrazovky nebo pomocna logika
```

Pravidla:

- API typy nepis rucne, pokud je umi dodat OpenAPI/Orval.
- Fetch funkce pro endpointy nepis rucne, pokud je umi vygenerovat Orval.
- Generovany kod rucne neupravuj.
- Rucni fetch zaklad pridej az ve chvili, kdy je jasne, ze ho Orval potrebuje.
- Base URL backendu muze byt v `EXPO_PUBLIC_API_URL`.
- Lokalni backend typicky bezi na `http://localhost:3000`.
- Orval config pridej nebo men az po potvrzeni konkretniho codegen flow.

## Kde co hledat

```text
app/
  _layout.tsx              # root layout a navigace
  index.tsx                # uvodni route

src/                       # zatim nemusi existovat; zaloz az kdyz je potreba
```

## Styl kodu

- Pouzivej TypeScript.
- Funkce pis jako arrow functions: `const fn = () => {}`.
- Pouzivej `async/await`, ne `.then()` retezce.
- Preferuj `const`; `let` jen kdyz je potreba reassignment; `var` nikdy.
- Komentare pis jen tam, kde kod sam nevysvetluje zamer.

## Dev prikazy

```bash
npm run start
npm run android
npm run ios
npm run web
npm run lint
```
