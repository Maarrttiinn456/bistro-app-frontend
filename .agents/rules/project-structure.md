# Project structure rules

Tenhle soubor doplnuje hlavni `AGENTS.md`. Ma drzet prakticka pravidla pro strukturu projektu, ne velkou architekturu dopredu.

## Zakladni pravidlo

- `app/` je pro routy, layouty a obrazovky.
- Do `app/` nedavej test soubory (`*.test.tsx`, `*.test.ts`). Expo Router je muze brat jako routy a Metro je pak bundluje do aplikace. Testy pro screeny z `app/` patri do `tests/screens/`.
- `src/` je pro pomocny kod mimo obrazovky, az kdyz zacne byt potreba.
- `assets/` je pro obrazky a staticke soubory.
- Kdyz neco neni potreba sdilet, nech to co nejbliz obrazovce.
- Nove slozky nezakladej dopredu jen proto, ze by se jednou mohly hodit.

## Expo Router routy

- Kdyz dynamicka route zacne mit child routy, pouzij slozkovy tvar s `index.tsx`.
- Priklad: detail receptu s editaci patri do `app/(tabs)/recipes/[recipeId]/index.tsx` a `app/(tabs)/recipes/[recipeId]/edit.tsx`, ne do kombinace `[recipeId].tsx` a `[recipeId]/edit.tsx`.
- Stejne pravidlo plati pro dalsi entity, napr. `ingredients/[ingredientId]/index.tsx` vedle `ingredients/[ingredientId]/edit.tsx`.
- Pri upravach Expo Router rout automaticky hlidej tuhle strukturu a navrhni opravu, kdyz narazis na smichany tvar.

## Minimalni cilova struktura

```text
app/
  _layout.tsx              # root layout a navigace
  index.tsx                # uvodni route

src/
  api/
    mutator.ts             # spolecny fetch/mutator pro Orval
    generated/             # generovany API klient a typy

  auth/
    AuthProvider.tsx       # auth stav a provider
    useAuth.ts             # hook pro cteni auth kontextu
    authStorage.ts         # ulozeni tokenu/session pres SecureStore

  query/
    queryClient.ts         # TanStack Query klient

tests/
  screens/                 # testy obrazovek z app/, mimo Expo Router routy
```

## API a Orval

- `src/api/generated/` je vystup z Orvalu.
- `src/api/mutator.ts` je spolecne misto pro backend base URL, auth header a zakladni error handling.
- Detailni backend/API pravidla jsou v `.agents/rules/backend-api.md`.

## Auth

- Auth patri do `src/auth/`, protoze typicky obsahuje vic nez jen React context.
- `AuthProvider.tsx` drzi auth stav a session restore.
- `useAuth.ts` je verejny hook pro cteni auth stavu z obrazovek a komponent.
- `authStorage.ts` resi ulozeni tokenu nebo session, typicky pres Expo SecureStore.

## Query

- TanStack Query setup patri do `src/query/queryClient.ts`.
- `QueryClientProvider` se muze skladat primo v `app/_layout.tsx`, dokud je to citelne.

## Co nezakladat dopredu

- `src/hooks/` zaloz az pro prvni opravdu obecny hook bez domenove vazby.
- `src/lib/` zaloz az pro prvni opravdu obecny helper.
- `src/features/` zaved az kdyz jedna domena zacne mit vic vlastnich hooku, komponent nebo logiky.
- `AppProviders.tsx` nezakladej dopredu. Pridej ho az ve chvili, kdy `app/_layout.tsx` zacne byt preplneny globalnimi providery.
