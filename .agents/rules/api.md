# API pravidla

## Backend komunikace

- Veškeré HTTP volání jde přes Fastify backend.
- Env proměnná pro base URL je `EXPO_PUBLIC_API_URL`.
- Backend lokálně typicky běží na portu `3000`.
- Backend vystavuje OpenAPI pro frontend codegen; výchozí očekávaná cesta je `/openapi.json`.
- Před změnou API klienta ověř aktuální backend repo a OpenAPI kontrakt.

## Orval

- Používej Orval pro generování API klienta, typů a TanStack Query hooků.
- Generovaný kód patří do `src/api/generated/`.
- Ručně nepiš API typy, které může dodat OpenAPI/Orval.
- Ruční frontend typy používej jen pro UI, formuláře a view-model stav, který v API neexistuje.
- Orval config zatím nevytvářej ani nerozšiřuj komplexně bez potvrzení.

## HTTP transport

- HTTP transport má být custom `fetch` mutator pro Orval.
- Mutator patří do `src/api/mutator.ts`.
- Při `401` má mutator zavolat `/v1/auth/refresh`, uložit nové tokeny a jednou retrynout původní request.
- Pokud refresh selže, request nesmí běžet v nekonečné smyčce; auth stav se má vyčistit přes auth vrstvu.

## TanStack Query

- Query client konfigurace patří do `src/api/query-client.ts`.
- Feature-specific query usage drž u konkrétní domény v `src/features/<domain>/hooks`.
- Nepiš vlastní cache vrstvu mimo TanStack Query bez potvrzení.
