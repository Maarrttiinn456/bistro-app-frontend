# Bistro app — frontend

Expo SDK 54 + React Native + Expo Router + TypeScript.

## Jazyk

- Komunikuj s uživatelem česky, pokud uživatel výslovně nepožádá o jiný jazyk.
- Projektové poznámky, komentáře a dokumentaci piš česky, pokud nejde o technické názvy, API kontrakty nebo převzatý text.

## Pracovní pravidla

- Před psaním Expo kódu čti přesnou verzovanou dokumentaci: https://docs.expo.dev/versions/v54.0.0/.
- Dělej pouze to, co uživatel explicitně zadal.
- Neměň architekturu projektu bez potvrzení.
- Nepřidávej zbytečné abstrakce, dokud není reálná potřeba nebo opakované použití.
- Pokud je rozpor mezi Notionem a backend repem, vyšší váhu má backend repo `Maarrttiinn456/bistro-app-backend`.

## Architektonická pravidla

@.agents/rules/architecture.md

## API pravidla

@.agents/rules/api.md

## Auth pravidla

@.agents/rules/auth.md

## Struktura projektu

@.agents/rules/project-structure.md

## Feature docs

Před prací na konkrétní feature si přečti relevantní soubor v `.agents/docs/`.
Soubory se nenačítají automaticky — vyžádej si ten relevantní podle domény.

## Dev příkazy

```bash
npm run start    # Expo dev server
npm run android  # Android build/run
npm run ios      # iOS build/run
npm run web      # Expo web
npm run lint     # lint kontrola
```

## .agents složka

```text
.agents/
  docs/   # kontextové a feature dokumenty
  rules/  # pravidla, která root AGENTS.md odkazuje
```
