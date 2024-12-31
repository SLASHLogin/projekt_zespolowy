# Aplikacja do rozliczeń grupowych (Split Expenses)

## Opis projektu

### Cel projektu

Stworzenie lekkiej, łatwej w użyciu aplikacji webowej do zarządzania wspólnymi wydatkami w grupie. Aplikacja ma umożliwiać użytkownikom śledzenie wydatków grupowych i automatyczne obliczanie, kto komu jest winien pieniądze, z uwzględnieniem różnych walut.

### Główne założenia techniczne

1. Aplikacja będzie działać całkowicie po stronie klienta (client-side), wykorzystując JavaScript do wszystkich obliczeń i operacji.
2. Serwer będzie pełnił wyłącznie rolę dostawcy statycznych plików (HTML, CSS, JS).
3. Wszystkie dane będą przechowywane lokalnie w przeglądarce użytkownika, z możliwością eksportu i importu.
4. Interfejs ma być responsywny i dostosowany do urządzeń mobilnych.

### Funkcjonalności podstawowe

1. Zarządzanie wydatkami:
   - Dodawanie nowych wydatków z określeniem płatnika i beneficjentów
   - Edycja istniejących wydatków
   - Usuwanie wydatków
   - Możliwość określenia różnych udziałów w wydatkach

2. Obsługa wielu walut:
   - Możliwość dodawania wydatków w różnych walutach
   - Ręczne wprowadzanie kursów walut przez użytkownika
   - Przeliczanie wszystkich kwot na walutę główną

3. System rozliczeń:
   - Automatyczne obliczanie bilansów
   - Możliwość rejestrowania spłat między uczestnikami
   - Funkcja resetowania/zerowania rozliczeń
   - Wizualizacja przepływów pieniężnych

4. Zarządzanie danymi:
   - Eksport stanu aplikacji do pliku (JSON/YAML/CSV)
   - Import danych z pliku
   - Automatyczny zapis stanu w localStorage przeglądarki

### Wymagania niefunkcjonalne

1. Wydajność:
   - Szybkie ładowanie strony (<2s)
   - Płynne działanie nawet przy dużej liczbie transakcji
   - Minimalne zużycie zasobów przeglądarki

2. Użyteczność:
   - Intuicyjny interfejs użytkownika
   - Responsywny design (mobile-first)
   - Przejrzysta prezentacja danych
   - Obsługa różnych przeglądarek

3. Niezawodność:
   - Walidacja wprowadzanych danych
   - Zabezpieczenie przed utratą danych
   - Obsługa błędów użytkownika

4. Utrzymywalność:
   - Modułowa architektura kodu
   - Dokumentacja kodu i funkcjonalności
   - Łatwość rozbudowy o nowe funkcje

### Technologie

1. Frontend:
   - HTML5
   - CSS3 z Bootstrap 5
   - JavaScript (ES6+)
   - System budowania: Vite.js

2. Serwer:
   - NGINX do serwowania statycznych plików

### Ograniczenia

1. Brak backendu - wszystkie operacje wykonywane są po stronie klienta
2. Brak synchronizacji danych między użytkownikami
3. Brak zewnętrznych API do pobierania kursów walut
4. Brak persystencji danych na serwerze

### Metryki sukcesu

1. Aplikacja działa w pełni offline po pierwszym załadowaniu
2. Czas ładowania strony poniżej 2 sekund
3. Poprawne działanie na wszystkich głównych przeglądarkach
4. Brak błędów w obliczeniach rozliczeń
5. Intuicyjna obsługa potwierdzona przez testy użytkowników

## Lista zadań do stworzenia aplikacji

### 1. Konfiguracja projektu i środowiska

- [x] Utworzenie struktury projektu
- [x] Konfiguracja systemu budowania (np. Vite.js dla szybkiego developmentu)
- [x] Instalacja i konfiguracja frameworka CSS (Bootstrap 5 dla responsywności i lekkości)
- [x] Konfiguracja systemu kontroli wersji (Git)
- [x] Utworzenie podstawowego pliku HTML z odpowiednimi metatagami dla RWD

### 2. Implementacja interfejsu użytkownika

- [x] Zaprojektowanie i implementacja responsywnego layoutu strony
- [x] Utworzenie formularza dodawania nowego wydatku z polami: kwota, płatnik, beneficjenci
- [ ] Implementacja wielowalutowego wyboru przy dodawaniu wydatku
- [ ] Utworzenie widoku listy wszystkich wydatków z możliwością edycji i usuwania
- [ ] Implementacja widoku podsumowania rozliczeń (kto, komu, ile)
- [ ] Dodanie modalnego okna do wprowadzania kursów walut
- [ ] Utworzenie interfejsu do rejestrowania spłat między uczestnikami
- [ ] Implementacja przycisku do resetowania wszystkich rozliczeń

### 3. Implementacja logiki biznesowej

- [ ] Utworzenie klasy zarządzającej stanem aplikacji
- [ ] Implementacja algorytmu obliczającego bilans należności
- [ ] Dodanie obsługi wielu walut i ich przeliczania
- [ ] Implementacja mechanizmu zapisywania stanu do pliku (JSON)
- [ ] Implementacja mechanizmu wczytywania stanu z pliku
- [ ] Dodanie walidacji wprowadzanych danych
- [ ] Implementacja obsługi spłat między uczestnikami
- [ ] Dodanie funkcji resetowania rozliczeń

### 4. Optymalizacja i testowanie

- [ ] Optymalizacja wydajności renderowania komponentów
- [ ] Implementacja mechanizmu buforowania obliczeń
- [ ] Testowanie responsywności na różnych urządzeniach
- [ ] Testowanie obsługi różnych formatów plików i danych
- [ ] Sprawdzenie poprawności obliczeń dla różnych scenariuszy
- [ ] Testowanie wydajności dla dużej liczby transakcji

### 5. Dodatkowe funkcjonalności

- [ ] Dodanie eksportu rozliczeń do PDF
- [ ] Implementacja historii zmian
- [ ] Dodanie możliwości kategoryzacji wydatków
- [ ] Implementacja widoku statystyk wydatków
- [ ] Dodanie możliwości podziału wydatku na nierówne części
- [ ] Implementacja prostego systemu tagów dla wydatków

### 6. Dokumentacja i wdrożenie

- [ ] Przygotowanie dokumentacji użytkownika
- [ ] Utworzenie pliku README z instrukcją instalacji
- [ ] Konfiguracja NGINX do serwowania statycznej strony
- [ ] Przygotowanie plików konfiguracyjnych dla różnych środowisk
- [ ] Utworzenie skryptów automatyzujących proces budowania
- [ ] Testowanie konfiguracji serwera

### 7. Optymalizacja UX

- [ ] Dodanie komunikatów o błędach i potwierdzeniach
- [ ] Implementacja systemu podpowiedzi (tooltipów)
- [ ] Dodanie skrótów klawiaturowych
- [ ] Optymalizacja formularzy pod kątem UX
- [ ] Implementacja auto-zapisu
- [ ] Dodanie trybu ciemnego/jasnego
