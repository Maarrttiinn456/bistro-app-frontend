# Auth pravidla

## Token storage

- Tokeny ukládej přes `expo-secure-store`.
- Token read/write/delete logika patří do `src/auth/token-store.ts`.
- Neukládej dlouhodobé auth tokeny do plain AsyncStorage, source-controlled configu ani jen do React state.

## Auth vrstva

- Auth provider patří do `src/auth/auth-provider.tsx`.
- Auth hook patří do `src/auth/use-auth.ts`.
- Auth stav má být oddělený od route souborů v `app/`.
- Route soubory mohou auth stav číst, ale nemají obsahovat token storage ani refresh logiku.

## Refresh flow

- Refresh token se posílá přes Fastify backend endpoint `/v1/auth/refresh`.
- Po úspěšném refreshi ulož nové tokeny přes `src/auth/token-store.ts`.
- Původní request retryuj maximálně jednou.
- Při logoutu nebo neúspěšném refreshi tokeny smaž.
