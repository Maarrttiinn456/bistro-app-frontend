# Doménová mapa

Frontend domény kopírují hranice backendu.

## `auth`

- Přihlášení, registrace, refresh, logout, aktuální uživatel.
- Frontend složka: `src/auth`.
- Route skupina: `app/(auth)`.

## `profile`

- Profil uživatele, cíle maker, aktivní domácnost.
- Frontend složka: `src/features/profile`.
- Route: `app/(tabs)/profile.tsx`.

## `ingredients`

- Suroviny, makra na 100 g/ml, barcode/search napojení.
- Frontend složka: `src/features/ingredients`.

## `recipes`

- Recepty, suroviny receptu, detail, tvorba a import.
- Frontend složka: `src/features/recipes`.
- Routes: `app/(tabs)/recipes.tsx`, `app/recipes/[recipeId].tsx`, `app/recipes/new.tsx`.

## `meal-plan`

- Plán jídel, sloty, osobní gramáže, označení jako snědené.
- Frontend složka: `src/features/meal-plan`.
- Routes: `app/(tabs)/plan.tsx`, `app/meal-plan/slots/[slotId].tsx`.

## `food-log`

- Reálně snědená jídla, snapshot maker, ruční záznamy.
- Frontend složka: `src/features/food-log`.
- Routes: `app/(tabs)/log.tsx`, `app/food-log/[logId].tsx`, `app/food-log/new.tsx`.

## `overview/dashboard`

- Dnešní přehled, denní součty, progress proti cílům.
- Frontend složka: `src/features/dashboard`.
- Route: `app/(tabs)/index.tsx`.
