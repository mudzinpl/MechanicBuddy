# MechanicBuddy Demo 1.0

## Cel

Doprowadzić obecny system MechanicBuddy do stabilnej wersji demonstracyjnej, na której można prowadzić 10–20 rzeczywistych spraw i zbierać uwagi z codziennej pracy.

Nie budujemy systemu od zera. W repozytorium istnieją już podstawowe moduły warsztatowe, Case Flow oraz obsługa przygotowania i wykonania oględzin. Najpierw stabilizujemy ten rdzeń, następnie uruchamiamy pilotaż, a większe integracje dokładamy pakietami.

## Zasada realizacji

- zmiany grupujemy w większe, logiczne pakiety,
- nie wdrażamy wszystkiego jednocześnie bez kontroli zależności,
- nie wracamy do ponownego opisywania procesów, które zostały już ustalone,
- wersja demo ma powstać możliwie szybko,
- kolejne poprawki wynikają z prowadzenia prawdziwych spraw.

## Zakres obowiązkowy Demo 1.0

### 1. Stabilizacja techniczna

- pełny start przez Docker Compose,
- migracje PostgreSQL bez błędów,
- działające logowanie i sesja,
- poprawny build frontendu i backendu,
- usunięcie błędów blokujących podstawowe ekrany,
- trwałość danych po restarcie,
- procedura kopii zapasowej i odtworzenia bazy.

### 2. Rdzeń sprawy

- utworzenie sprawy,
- klient, właściciel i płatnik,
- pojazd: VIN, numer rejestracyjny, marka i model,
- numer szkody i ubezpieczyciel,
- rodzaj szkody: OC albo AC,
- wariant AC: serwisowy, kosztorysowy, sieć partnerska lub inny,
- statusy i historia Case Flow,
- przygotowanie do oględzin,
- wykonanie oględzin,
- ustalenia i dodatkowe uszkodzenia,
- zdjęcia i dokumenty przypisane do sprawy,
- zadania i terminy.

### 3. Interfejs

- jednolite nazewnictwo po polsku,
- czytelna lista spraw,
- czytelny widok szczegółów sprawy,
- spójne statusy i filtry,
- brak martwych przycisków,
- uproszczenie ekranów do funkcji potrzebnych w pilotażu.

### 4. Rozliczenia — model danych pod Fakturownię

Każda sprawa może mieć jedną lub wiele pozycji rozliczeniowych. Pozycje muszą być rozdzielone według płatnika:

- ubezpieczyciel,
- klient prywatny,
- kontrahent zewnętrzny.

Przykładowe pozycje:

- zaliczka na poczet naprawy,
- door-to-door,
- samochód zastępczy,
- holowanie,
- parkowanie lub przechowywanie,
- przygotowanie pojazdu do oględzin,
- demontaż diagnostyczny,
- oględziny,
- kosztorys,
- diagnostyka,
- prace prywatne,
- części.

Każda pozycja powinna mieć status:

- wykonano,
- udokumentowano,
- do rozliczenia,
- rozliczono.

Dla części należy przechowywać:

- cenę zakupu lub hurtową,
- cenę sprzedaży,
- marżę,
- dostawcę,
- numer katalogowy.

Pełna integracja API z Fakturownią nie blokuje uruchomienia pilotażu, ale struktura danych i interfejs muszą być przygotowane pod tworzenie dokumentu „Zamówienie”.

### 5. Kontrola wpływów

Na etapie Demo 1.0 system ma umożliwiać ręczne zapisanie wpływu:

- kwota,
- data,
- nadawca,
- tytuł przelewu,
- powiązana sprawa,
- oznaczenie kwoty bezspornej,
- informacja, czy wystawiono wymagane dokumenty sprzedaży.

System powinien pokazywać listę wpływów nierozliczonych.

Bezpośrednia integracja z bankiem zostanie wdrożona po ustaleniu dostępnego API, Open Banking albo formatu importu MT940/CSV.

### 6. Kosztorysy

Jeżeli nie będzie dostępu do Audatex/Audanet API, system ma obsługiwać:

- dodanie kosztorysu warsztatu,
- dodanie kosztorysu lub zwrotki ubezpieczyciela,
- oznaczenie typu dokumentu,
- porównanie kosztorysów,
- przygotowanie struktury do odczytu części, operacji i różnic.

Rodzaj szkody i wariant AC mają wpływać na sposób analizy części oraz rozliczenia, ale ostateczny wybór pozostaje po stronie użytkownika.

## Pilotaż

- osobne środowisko i baza danych demo,
- wprowadzenie 10–20 rzeczywistych spraw,
- codzienna rejestracja błędów i braków,
- poprawki realizowane pakietami,
- brak przebudowy stabilnych modułów bez konkretnej potrzeby.

## Pakiety po uruchomieniu Demo 1.0

### Pakiet A — Fakturownia

- tworzenie dokumentu „Zamówienie”,
- dane klienta, właściciela lub płatnika,
- dane pojazdu,
- numer szkody i VIN w opisach pozycji,
- jedna lub wiele pozycji,
- link i identyfikator dokumentu zapisany w sprawie,
- dalsza faktura, faktura zaliczkowa lub końcowa tworzona z zamówienia.

### Pakiet B — części i dostawcy

- import numerów części z kosztorysu,
- porównanie oficjalnych dystrybutorów i autoryzowanych źródeł,
- Inter Cars z cenami konta warsztatowego,
- Allegro jako dodatkowe źródło,
- cena, dostępność i termin dostawy,
- rozróżnienie oryginał/zamiennik,
- zapis ceny zakupu, sprzedaży i marży,
- przygotowanie koszyka lub zamówienia, jeśli dostawca udostępnia API.

### Pakiet C — bank i płatności

- API bankowe lub Open Banking,
- alternatywnie import MT940/CSV,
- dopasowanie przelewów do spraw i dokumentów,
- wykrywanie kwot bezspornych,
- alerty o brakujących dokumentach sprzedaży.

### Pakiet D — automatyzacje procesowe

- checklisty zależne od rodzaju sprawy,
- kontrola wykonanych, ale niezafakturowanych usług,
- przegląd rozliczeń przed zamknięciem sprawy,
- przypomnienia o dokumentach i terminach.

### Pakiet E — onboarding

- interaktywny samouczek,
- graficzne wskazówki,
- test użytkownika,
- pierwsze uruchomienie traktowane jako szkolenie nowego pracownika.

## Kryteria ukończenia Demo 1.0

Wersja demonstracyjna jest gotowa, gdy:

1. system uruchamia się powtarzalnie,
2. można utworzyć i prowadzić sprawę od zgłoszenia przez oględziny,
3. można zapisać dokumenty, zdjęcia, ustalenia, statusy i pozycje do rozliczenia,
4. dane nie giną po restarcie,
5. można prowadzić minimum 10 rzeczywistych spraw,
6. nie ma znanych błędów blokujących pracę.

## Kolejność najbliższych prac

1. Audyt aktualnego `main`.
2. Uruchomienie buildów i testów.
3. Lista błędów blokujących.
4. Jeden pakiet stabilizacyjny.
5. Uporządkowanie rdzenia sprawy i interfejsu.
6. Dodanie minimalnego modelu rozliczeń i wpływów.
7. Wdrożenie środowiska demo.
8. Pilotaż na rzeczywistych sprawach.
