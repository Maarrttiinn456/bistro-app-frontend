# Struktura projektu

## Princip

Struktura má růst podle reálného kódu. Nezakládej složky jen proto, že budou možná potřeba později. Doménové členění podle backendu zůstává cílový směr, ale konkrétní složka vzniká až ve chvíli, kdy v ní existuje skutečný obsah.

## Pravidla složek

- `app/` obsahuje Expo Router routes a layouty.
- `app/` skládá obrazovky, ale nemá obsahovat token storage, refresh logiku ani větší business logiku.
- `src/api/generated/` je vyhrazené pro Orval výstup.
- `src/api/mutator.ts` vlastní custom fetch transport.
- `src/api/query-client.ts` vlastní TanStack Query client setup.
- `src/auth/` obsahuje auth provider, auth hooky a token store.
- `src/config/` obsahuje runtime konfiguraci aplikace.
- `src/features/<domain>/` zakládej až při prvním reálném doménovém kódu mimo route soubor.
- `src/features/<domain>/hooks/` zakládej až při prvním doménovém hooku.
- `src/features/<domain>/utils/` zakládej až při první doménové utilitě.
- `src/features/<domain>/types.ts` zakládej až při prvním UI-only typu, který nedodává OpenAPI/Orval.
- `src/components/` zakládej až při reálném reuse sdílené UI, layout nebo feedback komponenty.
- `src/lib/` zakládej až při prvním malém sdíleném helperu bez doménové vazby.
- `src/theme/` zakládej až při prvních design tokenech použitých v aplikaci.
- Prázdné složky drž přes `.gitkeep` jen u složek, které musí existovat kvůli nástroji nebo codegenu.

## Minimální aktuální strom

```text
app/
  _layout.tsx
  +not-found.tsx
  index.tsx
  (auth)/
    _layout.tsx
    login.tsx
    signup.tsx
  (tabs)/
    _layout.tsx
    index.tsx
    plan.tsx
    recipes.tsx
    log.tsx
    profile.tsx
  recipes/
    [recipeId].tsx
    new.tsx
  meal-plan/
    slots/
      [slotId].tsx
  food-log/
    [logId].tsx
    new.tsx

src/
  api/
    generated/
      model/
        .gitkeep
    mutator.ts
    query-client.ts
  auth/
    auth-provider.tsx
    token-store.ts
    use-auth.ts
  config/
    env.ts
    api-url.ts

assets/
  images/
```

## Růst podle domén

Když vznikne reálná feature logika, drž domény podle backendu:

```text
src/features/
  dashboard/
  recipes/
  meal-plan/
  food-log/
  ingredients/
  profile/
```

Uvnitř domény přidávej jen složky, které právě potřebuješ. Například první query wrapper pro recepty může založit `src/features/recipes/hooks/`, zatímco UI-only typy receptů mohou založit `src/features/recipes/types.ts`.
