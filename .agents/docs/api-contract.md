# API kontrakt a frontend typy

## Rozhodnutí

Frontend je samostatný Expo projekt. Typovaný API klient, API typy a TanStack Query hooky se generují z OpenAPI výstupu backendu pomocí Orvalu.

## Proč

- Backend je hlavní zdroj pravdy pro HTTP kontrakt.
- OpenAPI je stabilní hranice mezi backend a frontend repozitářem.
- Orval umí z OpenAPI generovat TypeScript typy a query hooky použitelné v React Native.
- Ruční API typy ve frontendu by snadno zastaraly proti backendu.

## Flow

```text
Fastify route schema
  -> OpenAPI JSON na backendu
  -> Orval ve frontend repu
  -> generovaný API klient, typy a TanStack Query hooky
  -> feature hooky v src/features/<domain>/hooks
```

## Pravidla

- API typy generuj z OpenAPI/Orval.
- UI-only typy drž v `src/features/<domain>/types.ts`.
- Custom mutator drž v `src/api/mutator.ts`.
- Query client setup drž v `src/api/query-client.ts`.
- Orval config přidej až po potvrzení konkrétního codegen nastavení.
