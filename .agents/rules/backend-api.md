# Backend and API rules

Zdroj pravdy dat je backend repo:

```text
https://github.com/Maarrttiinn456/bistro-app-backend
```

Backend repo urcuje datove modely, endpointy, OpenAPI kontrakt a vyznam dat.
Frontend ma API kontrakt brat z backend OpenAPI vystupu, nedomyslet datove
modely rucne a nikdy nevolat Supabase primo.

Zjednoduseny tok:

```text
backend schema
  -> OpenAPI JSON
  -> Orval
  -> generovane typy a fetch funkce
  -> funkce/hooky pro fetch dat
  -> obrazovky nebo pomocna logika
```

## Pravidla

- Frontend nikdy nevola Supabase primo.
- API typy nepis rucne, pokud je umi dodat OpenAPI/Orval.
- Fetch funkce pro endpointy nepis rucne, pokud je umi vygenerovat Orval.
- Generovany kod rucne neupravuj.
- Rucni fetch zaklad pridej az ve chvili, kdy je jasne, ze ho Orval potrebuje.
- Base URL backendu muze byt v `EXPO_PUBLIC_API_URL`.
- Lokalni backend typicky bezi na `http://localhost:3000`.
- Orval config pridej nebo men az po potvrzeni konkretniho codegen flow.

## Umisteni ve frontend repu

- `orval.config.ts` patri do rootu projektu.
- `src/api/generated/` je vystup z Orvalu a rucne se neupravuje.
- `src/api/mutator.ts` je spolecne misto pro backend base URL, auth header a zakladni error handling.
