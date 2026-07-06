# Workflow rules

Pravidla pro spolupraci s agentem v tomhle projektu.

## Jazyk a styl

- Komunikuj cesky, pokud uzivatel nepise anglicky.
- Odpovidej kratce a k veci.
- Bez emoji, pokud o ne uzivatel nepozada.
- Vysvetluj jednoduse, proc neco patri do dane slozky nebo casti projektu.

## Rozsah prace

- Delej jen to, co uzivatel zadal.
- Pomahas po malych krocich.
- Negeneruj celou appku, pokud o to uzivatel vyslovne nepozada.
- Preferuj jednoduche a minimalni reseni pred komplexnim, pokud komplexita neni zjevne potreba.
- Optimalizace a abstrakce pridavej az ve chvili, kdy pro ne existuje konkretni duvod.
- U vetsich zmen nejdriv napis kratky plan.
- Nemen architekturu bez potvrzeni.
- Nezakladej slozky dopredu jen proto, ze by se jednou mohly hodit.

## Potvrzeni

- Nevratne akce, napr. delete, force push, send nebo publish, vyzaduji explicitni potvrzeni.
- Externi komunikaci pripravuj jen jako draft k review, nikdy ji neposilej automaticky.

## Testovani

- Ke kazde nove nebo zmenene funkcionalite pridej odpovidajici test.
- Pokud opravujes bug, nejdriv se pokus pridat nebo upravit test, ktery bug reprodukuje a po oprave projde.
- Testy pis behavior-first pres React Native Testing Library.
- Testuj verejne chovani a kriticke stavy, ne implementacni detaily.
- Netestuj `src/api/generated/`, styly, barvy, layout pixely ani cele obrazovky pres snapshoty.
- V testech importuj Jest globals explicitne z `@jest/globals`.
- Pri zmene auth nebo data logiky spust relevantni test, pripadne `npm run test:watch`.
- Po dokonceni smysluplne casti spust `npm test`.

## Merge do develop

- Bezne pracuj na `feature/...` vetvi.
- Pred mergem do `develop` vzdy spust `npm test`, `npm run lint` a `npm run typecheck`.
- Do `develop` nemerguj rozbity stav.
- Primarni cesta je PR z feature vetve; primy push do `develop` jen vyjimecne.
- CI ma kontrolovat PR do `develop` a push do `develop`.

## Code review

- Code review pouzij az po zelenych testech a lintu.
- Nejvetsi smysl dava pred mergem do `develop`.
- Pouzij ho hlavne u auth flow, API/session zmen, navigace, vetsich refactoru a zmen s nejasnym dopadem.
- Code review nenahrazuje testy; testy hlidaji chovani opakovane, review hleda rizika a mezery.
