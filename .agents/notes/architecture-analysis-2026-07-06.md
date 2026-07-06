# Architecture analysis - current state

Datum: 2026-07-06
Stav: zapis z architektonicke analyzy, neni zavazne pravidlo

## Kontext

Projekt je Expo + React Native aplikace s Expo Routerem.

Projektova pravidla jsou v:

- `AGENTS.md`
- `.agents/rules/workflow.md`
- `.agents/rules/project-structure.md`
- `.agents/rules/backend-api.md`
- `.agents/rules/coding-style.md`

V dobe analyzy nebyl v repu nalezen `CONTEXT.md` ani `docs/adr`.

Zelene testy v dobe analyzy:

- `npm test`
- 12 test suites passed
- 84 tests passed

## Kratke shrnuti stavu

Architektura je v dobrem ranem stavu. `app/` drzi route a screen soubory,
`src/` ma prirozene domenove casti `auth`, `recipes`, `ingredients`, `api`,
`query` a sdilene `components`.

Recepty jsou architektonicky dal nez ingredience. `app/(tabs)/recipes/create.tsx`
uz hlavne sklada obrazovku a slozitejsi stav je vytazeny do
`src/recipes/useCreateRecipeForm.ts` a cistych funkci v
`src/recipes/createRecipeForm.ts`.

Ingredience jsou zatim vice screen-heavy. Nejvic je to videt u barcode scan flow
a create ingredient flow.

## Co nemenit bez dobreho duvodu

- `src/auth` zatim nemenit jen kvuli delce. `AuthProvider`, `useAuth` a
  `authStorage` tvori rozumny modul s jasnym verejnym hookem a storage
  adapterem.
- `app/(tabs)` routing strukturu zatim nemenit. Nested stacky pro `recipes` a
  `ingredients` davaji smysl.
- Nezakladat obecne `src/hooks`, `src/lib` ani velke `src/features` dopredu.
  Soucasne `src/recipes` a `src/ingredients` jsou pro projekt vhodnejsi.
- `src/components/Screen.tsx` ponechat. Je maly, ale brani opakovani safe-area
  layoutu.
- `src/recipes/createRecipeForm.ts` ponechat jako modul s realnou hloubkou.
  Neni to jen pruchozi helper, schovava validaci, parsing, vypocet maker a
  tvorbu request body.

## Hlavni problemy podle priority

### 1. Barcode scan screen je prilis siroky

Soubory:

- `app/(tabs)/ingredients/scan.tsx`

Problem:

Screen v jednom modulu resi kameru, permissions, barcode resolving, error
mapping, query invalidaci, handoff do recipe flow, routing a UI stavy. To je
realny problem, ne jen esteticka preference.

Navrh:

- Vytahnout workflow do `src/ingredients/useIngredientBarcodeScan.ts`.
- Ciste helpery presunout do `src/ingredients/ingredientBarcodeScan.ts` nebo
  podobne pojmenovaneho modulu.
- Screen nechat hlavne jako vizualni kompozici.

Dopad:

- Skaluje lepe pri dalsich stavech scan flow.
- Snizi mockovani ve screen testech.
- Zlepsi locality chyb kolem scan flow.

Riziko zmeny:

- Stredni. Flow kombinuje kameru, router a React Query cache.

### 2. Create ingredient screen nese moc business logiky

Soubory:

- `app/(tabs)/ingredients/create.tsx`
- `src/ingredients/createIngredientForm.ts`

Problem:

Screen validuje formular, parsuje cisla, stavi request body, mapuje backend
chyby, uklada handoff a invaliduje cache. Je to realny problem, protoze testy
obrazovky musi mockovat prilis mnoho okolnich veci.

Navrh:

- Rozsirit `src/ingredients/createIngredientForm.ts` o pure builder:
  `buildCreateIngredientBody`.
- Vytahnout submit flow do `src/ingredients/useCreateIngredientForm.ts`.
- Screen nechat hlavne jako render formularovych poli a submit buttonu.

Dopad:

- Lepsi testovatelnost pres mensi interface.
- Citelnejsi screen.
- Snazsi pridani dalsich poli, napriklad serving label nebo serving grams.

Riziko zmeny:

- Stredni.

### 3. Ingredient detail ma docasny detailovy datovy seam

Soubory:

- `app/(tabs)/ingredients/[ingredientId].tsx`
- `src/ingredients/useIngredientDetail.ts`

Problem:

Detail screen uz je obaleny pres `useIngredientDetail`, ale hook uvnitr stale
vola `useGetIngredients({ scope: all })` a hleda jednu ingredienci v seznamu.
Backend uz ma `GET /ingredients/:ingredientId` s `operationId: getIngredient`,
takze list lookup je jen docasna frontend implementace.

Navrh:

- Aktualizovat frontend OpenAPI kontrakt a regenerovat Orval klienta.
- Prepnout `src/ingredients/useIngredientDetail.ts` na vygenerovany
  `getIngredient` / `useGetIngredient`.
- Screen nechat zavisly na `useIngredientDetail`, aby se nemusel pri API zmene
  znovu prepisovat.

Dopad:

- Detail screen nebude tahat cely seznam kvuli jedne surovine.
- Frontend vyuzije backendove 404 chovani pro cizi, neexistujici nebo
  archivovanou surovinu.
- Zachova se lokalni frontend seam pro detail.

Riziko zmeny:

- Nizke az stredni. Hlavni riziko je sladit regenerovany Orval vystup,
  query key a loading/error stavy detailu.

### 4. Handoff mezi recipe flow a ingredient flow je rozprostreny

Soubory:

- `src/ingredients/createIngredientHandoff.ts`
- `src/recipes/useCreateRecipeForm.ts`
- `app/(tabs)/ingredients/create.tsx`
- `app/(tabs)/ingredients/scan.tsx`

Problem:

React Query cache key jako handoff je pragmaticka volba, ale caller musi znat
implementacni detail.

Navrh:

- Ponechat mechanismus.
- Schovat ho za male funkce nebo hooky, napr. `setCreatedIngredientHandoff`,
  `consumeCreatedIngredientHandoff`.

Dopad:

- Mene znalosti unikajici mezi `recipes` a `ingredients`.
- Mensi riziko chyb pri dalsim flow, ktere bude vytvaret ingredienci z receptu.

Riziko zmeny:

- Nizke.

### 5. Duplicitni formatovani a parsing

Soubory:

- `app/(tabs)/ingredients/index.tsx`
- `app/(tabs)/ingredients/scan.tsx`
- `app/(tabs)/ingredients/[ingredientId].tsx`
- `src/ingredients/createIngredientForm.ts`
- `src/recipes/createRecipeForm.ts`

Problem:

Opakuje se formatovani nutrition textu, formatovani cisel a normalizace route
paramu. Ne vse je nutne hned centralizovat. Relevance je hlavne u domenoveho
formatovani ingredienci.

Navrh:

- Zavest `src/ingredients/ingredientFormatters.ts` pro nutrition text a makra.
- Number parser sjednotit az ve chvili, kdy dalsi pouziti potvrdi, ze nejde jen
  o nahodnou duplicitu.
- Normalizaci route paramu centralizovat jen pokud se zacne opakovat vic.

Dopad:

- Jednotne texty napric list/detail/scan.
- Mensi drift v zobrazovani maker.

Riziko zmeny:

- Nizke.

### 6. Nepouzity rucni API modul

Soubory:

- `src/ingredients/ingredientApi.ts`

Problem:

Modul vypada jako starsi rucni vrstva. Orval uz generuje `archiveIngredient`,
ktery se aktualne pouziva v `IngredientDetailActionMenu`.

Navrh:

- Overit, jestli neni planovany pro jiny endpoint.
- Pokud ne, smazat.

Dopad:

- Mene zmatku v datove vrstve.

Riziko zmeny:

- Nizke.

## Doporucena cilova struktura

```text
app/
  (auth)/
  (tabs)/
    ingredients/        # route soubory, layout, vizualni kompozice
    recipes/            # route soubory, layout, vizualni kompozice

src/
  api/
    generated/
    mutator.ts
  auth/
  components/
  ingredients/
    createIngredientForm.ts
    createIngredientHandoff.ts
    ingredientFormatters.ts
    useCreateIngredientForm.ts
    useIngredientBarcodeScan.ts
    IngredientDetailActionMenu.tsx
  recipes/
    createRecipeForm.ts
    useCreateRecipeForm.ts
    recipeFormatters.ts
    CreateRecipe*.tsx
  query/
tests/
  screens/
```

## Co presunout, ponechat, smazat nebo sloucit

Presunout:

- Scan workflow z `app/(tabs)/ingredients/scan.tsx` do `src/ingredients`.
- Create ingredient submit workflow z `app/(tabs)/ingredients/create.tsx` do
  `src/ingredients`.

Ponechat:

- Route soubory v `app/(tabs)`.
- Recipe create rozpad.
- Auth modul.
- Orval generated klient.
- Testy obrazovek mimo `app`.

Sloucit nebo sjednotit:

- Ingredient nutrition formatters.
- Handoff helpery.
- Number parser jen pokud se potvrdi dalsi opakovani.

Smazat:

- `src/ingredients/ingredientApi.ts`, pokud se potvrdi, ze uz neni potreba.

## Bezpecny migracni plan

1. Uklidit nejmensi jiste veci:
   - odstranit nepouzity `src/ingredients/ingredientApi.ts`, pokud neni potreba,
   - sjednotit ingredient formatters.
2. Vytahnout pure `buildCreateIngredientBody` a error mapping pro create
   ingredient flow.
3. Vytahnout `useCreateIngredientForm`.
4. Aktualizovat OpenAPI/Orval a prepnout `useIngredientDetail` na detailovy
   `getIngredient` / `useGetIngredient`.
5. Vytahnout barcode scan workflow do `useIngredientBarcodeScan`.

## Doporučene navazani v dalsi session

Nejbezpecnejsi prvni krok je maly uklid:

- `src/ingredients/ingredientFormatters.ts`
- pripadne smazani `src/ingredients/ingredientApi.ts`

Nejvetsi architektonicky prinos bude mit:

- `useIngredientBarcodeScan`
- `useCreateIngredientForm`
