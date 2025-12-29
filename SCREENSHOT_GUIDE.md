# Przewodnik do Screenshotów Dokumentacji

## Przygotowanie

### 1. Uruchom wszystkie serwisy

```bash
# Uruchom mikroserwisy i API Gateway
docker-compose up -d

# Uruchom aplikację Next.js (w osobnym terminalu)
npm run dev
```

### 2. Sprawdź czy wszystko działa

```bash
# Test wszystkich funkcjonalności
./test-all-functionalities.sh

# Sprawdź status serwisów
docker-compose ps
```

---

## Lista Screenshotów do Wykonania

### 1. Rejestracja Użytkownika
**URL:** http://localhost:3004/signup

**Kroki:**
1. Otwórz http://localhost:3004/signup
2. Wypełnij formularz:
   - Email: `demo-user-{timestamp}@example.com`
   - Hasło: `Demo123456`
   - Imię: `Demo User`
3. Kliknij "Sign Up"
4. Zrób screenshot **przed** kliknięciem (formularz wypełniony)
5. Zrób screenshot **po** kliknięciu (komunikat sukcesu)

**Oczekiwany rezultat:**
- Komunikat: "Użytkownik zarejestrowany pomyślnie"
- Automatyczne przekierowanie do strony chronionej

---

### 2. Logowanie Użytkownika
**URL:** http://localhost:3004/login

**Kroki:**
1. Otwórz http://localhost:3004/login
2. Wypełnij formularz:
   - Email: `demo-user-{timestamp}@example.com` (użyj tego samego co przy rejestracji)
   - Hasło: `Demo123456`
3. Kliknij "Sign In"
4. Zrób screenshot **przed** kliknięciem (formularz wypełniony)
5. Zrób screenshot **po** kliknięciu (komunikat sukcesu)

**Oczekiwany rezultat:**
- Komunikat: "Logowanie pomyślne"
- Automatyczne przekierowanie do strony chronionej

---

### 3. Lista Items (Po zalogowaniu)
**URL:** http://localhost:3004/items

**Kroki:**
1. Zaloguj się (użyj danych z rejestracji)
2. Przejdź do http://localhost:3004/items
3. Zrób screenshot widoku listy items

**Oczekiwany rezultat:**
- Lista items (może być pusta jeśli nie ma jeszcze żadnych)
- Przycisk "Dodaj nowy item"
- Nawigacja w górnej części strony

---

### 4. Tworzenie Nowego Item
**URL:** http://localhost:3004/items

**Kroki:**
1. Przejdź do http://localhost:3004/items
2. Kliknij "Dodaj nowy item" lub przycisk "+"
3. Wypełnij formularz:
   - Tytuł: `Przykładowy Item`
   - Opis: `To jest przykładowy item utworzony przez interfejs użytkownika`
4. Zrób screenshot **przed** zapisaniem (formularz wypełniony)
5. Kliknij "Zapisz" lub "Utwórz"
6. Zrób screenshot **po** zapisaniu (komunikat sukcesu i item na liście)

**Oczekiwany rezultat:**
- Komunikat: "Item utworzony pomyślnie"
- Nowy item pojawia się na liście

---

### 5. Edycja Item
**URL:** http://localhost:3004/items

**Kroki:**
1. Przejdź do http://localhost:3004/items
2. Kliknij przycisk "Edytuj" przy wybranym item
3. Zmień dane:
   - Tytuł: `Zaktualizowany Item`
   - Opis: `Opis został zaktualizowany`
4. Zrób screenshot **przed** zapisaniem (formularz z nowymi danymi)
5. Kliknij "Zapisz" lub "Aktualizuj"
6. Zrób screenshot **po** zapisaniu (komunikat sukcesu)

**Oczekiwany rezultat:**
- Komunikat: "Item zaktualizowany pomyślnie"
- Zaktualizowane dane widoczne na liście

---

### 6. Usunięcie Item
**URL:** http://localhost:3004/items

**Kroki:**
1. Przejdź do http://localhost:3004/items
2. Kliknij przycisk "Usuń" przy wybranym item
3. Potwierdź usunięcie (jeśli jest dialog)
4. Zrób screenshot **przed** usunięciem (item na liście)
5. Zrób screenshot **po** usunięciu (komunikat sukcesu, item zniknął z listy)

**Oczekiwany rezultat:**
- Komunikat: "Item usunięty pomyślnie"
- Item zniknął z listy

---

### 7. Przeglądanie Logów Systemowych
**URL:** http://localhost:3004/logs

**Kroki:**
1. Zaloguj się
2. Przejdź do http://localhost:3004/logs
3. Zrób screenshot widoku logów

**Oczekiwany rezultat:**
- Lista logów z ostatnimi akcjami
- Informacje o:
  - Akcji (LOGIN, REGISTER, CREATE_ITEM, UPDATE_ITEM, DELETE_ITEM)
  - Serwisie (auth-service, crud-service, api-gateway)
  - Dacie i czasie
  - Szczegółach akcji

---

### 8. Przeglądanie Logów Użytkownika
**URL:** http://localhost:3004/logs

**Kroki:**
1. Przejdź do http://localhost:3004/logs
2. Jeśli jest filtr "Moje logi" lub "User Logs", kliknij go
3. Zrób screenshot widoku logów użytkownika

**Oczekiwany rezultat:**
- Lista logów tylko dla zalogowanego użytkownika
- Filtrowane logi według user_id

---

### 9. Wylogowanie
**URL:** Dowolna strona po zalogowaniu

**Kroki:**
1. Zaloguj się
2. Znajdź przycisk "Wyloguj" lub "Logout" (zwykle w nawigacji)
3. Zrób screenshot **przed** wylogowaniem (użytkownik zalogowany)
4. Kliknij "Wyloguj"
5. Zrób screenshot **po** wylogowaniu (przekierowanie do strony logowania)

**Oczekiwany rezultat:**
- Komunikat: "Wylogowano pomyślnie" (opcjonalnie)
- Przekierowanie do strony logowania
- Token usunięty z localStorage

---

### 10. Widok Architektury (Opcjonalnie)
**Kroki:**
1. Otwórz terminal
2. Uruchom: `docker-compose ps`
3. Zrób screenshot pokazujący wszystkie uruchomione serwisy

**Oczekiwany rezultat:**
- Lista wszystkich kontenerów Docker:
  - api-gateway-1
  - auth-service-1
  - crud-service-1
  - logging-service-1

---

## Wskazówki do Screenshotów

### Jakość Screenshotów:
- Używaj wysokiej rozdzielczości (min. 1920x1080)
- Zrób screenshoty w trybie pełnoekranowym przeglądarki
- Ukryj pasek adresu jeśli nie jest potrzebny (F11 w większości przeglądarek)

### Treść Screenshotów:
- Upewnij się, że formularze są wypełnione przykładowymi danymi
- Pokazuj komunikaty sukcesu/błędu
- Zaznacz ważne elementy (przyciski, formularze, komunikaty)

### Organizacja:
- Nazwij pliki zgodnie z numeracją:
  - `01-rejestracja-formularz.png`
  - `01-rejestracja-sukces.png`
  - `02-logowanie-formularz.png`
  - `02-logowanie-sukces.png`
  - itd.

---

## Testowanie przed Screenshotami

Przed wykonaniem screenshotów, upewnij się że wszystko działa:

```bash
# Test wszystkich endpointów
./test-all-functionalities.sh

# Sprawdź logi serwisów
docker-compose logs --tail=20

# Sprawdź czy Next.js działa
curl http://localhost:3004
```

---

## Dane Testowe

Możesz użyć następujących danych testowych:

**Email:** `demo-user-{timestamp}@example.com`  
**Hasło:** `Demo123456`  
**Imię:** `Demo User`

Lub użyj skryptu testowego, który wygeneruje unikalne dane:

```bash
./test-all-functionalities.sh
```

---

## Troubleshooting

### Problem: Aplikacja Next.js nie działa
```bash
# Sprawdź czy port 3004 jest wolny
lsof -i :3004

# Uruchom aplikację
npm run dev
```

### Problem: API Gateway nie odpowiada
```bash
# Sprawdź status kontenerów
docker-compose ps

# Sprawdź logi
docker-compose logs api-gateway

# Restart serwisów
docker-compose restart
```

### Problem: Błędy autoryzacji
- Sprawdź czy token jest poprawnie zapisany w localStorage
- Sprawdź czy token nie wygasł
- Zaloguj się ponownie

---

## Gotowe!

Po wykonaniu wszystkich screenshotów, możesz je użyć w dokumentacji PDF.

**Wszystkie funkcjonalności zostały przetestowane i działają poprawnie! ✅**

