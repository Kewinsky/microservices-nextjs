# Dokumentacja Projektu - System Mikroserwisów z API Gateway

## Spis Treści

1. [Wprowadzenie](#wprowadzenie)
2. [Architektura Systemu](#architektura-systemu)
3. [Technologie](#technologie)
4. [Struktura Projektu](#struktura-projektu)
5. [Funkcjonalności](#funkcjonalności)
6. [Instalacja i Uruchomienie](#instalacja-i-uruchomienie)
7. [Konfiguracja](#konfiguracja)
8. [Opis Interfejsu Użytkownika](#opis-interfejsu-użytkownika)
9. [API Endpoints](#api-endpoints)
10. [Baza Danych](#baza-danych)
11. [Testowanie](#testowanie)

---

## Wprowadzenie

Projekt przedstawia kompleksowy system mikroserwisów zbudowany w architekturze rozproszonej, komunikujący się poprzez centralny API Gateway. System składa się z trzech niezależnych mikroserwisów (Autoryzacja, CRUD, Logowanie) oraz aplikacji klienckiej zbudowanej w Next.js.

**Repozytorium projektu:** [Link do repozytorium GitHub]

### Główne Cele Projektu

- Demonstracja architektury mikroserwisów
- Implementacja centralnego API Gateway
- Pełna funkcjonalność CRUD z autoryzacją
- System logowania działań użytkowników i systemu
- Nowoczesny interfejs użytkownika z responsywnym designem

---

## Architektura Systemu

System składa się z następujących komponentów:

### 1. API Gateway

Centralny punkt komunikacji między klientem a mikroserwisami. Zapewnia:

- Routing żądań do odpowiednich mikroserwisów
- Autoryzację i weryfikację tokenów JWT
- Logowanie wszystkich operacji
- Obsługę błędów i timeoutów

### 2. Mikroserwis Autoryzacji (Auth Service)

Odpowiedzialny za:

- Rejestrację nowych użytkowników
- Logowanie użytkowników
- Generowanie i weryfikację tokenów JWT
- Zarządzanie sesjami użytkowników

### 3. Mikroserwis CRUD (CRUD Service)

Zapewnia pełne operacje na danych:

- **Create** - Tworzenie nowych rekordów
- **Read** - Odczyt rekordów (lista i pojedynczy)
- **Update** - Aktualizacja istniejących rekordów
- **Delete** - Usuwanie rekordów
- Wszystkie operacje wymagają autoryzacji JWT

### 4. Mikroserwis Logowania (Logging Service)

Rejestruje i przechowuje:

- Wszystkie akcje użytkowników
- Operacje systemowe
- Logi z API Gateway
- Informacje o IP, czasie i szczegółach akcji

### 5. Aplikacja Kliencka (Next.js)

Nowoczesna aplikacja webowa oferująca:

- Interfejs użytkownika do zarządzania danymi
- Formularze rejestracji i logowania
- Widok logów systemowych
- Responsywny design z obsługą trybu jasnego i ciemnego

### Diagram Architektury

```
┌─────────────┐
│   Client    │
│  (Next.js)  │
└──────┬──────┘
       │
       │ HTTP/HTTPS
       │
┌──────▼──────────────┐
│   API Gateway       │
│   (Port 3000)       │
└──────┬──────────────┘
       │
       ├──────────────┬──────────────┬──────────────┐
       │              │              │              │
┌──────▼──────┐ ┌─────▼──────┐ ┌─────▼──────┐ ┌─────▼─────┐
│ Auth Service│ │CRUD Service│ │Log Service │ │ Supabase  │
│ (Port 3001) │ │(Port 3002) │ │(Port 3003) │ │ Database  │
└─────────────┘ └────────────┘ └────────────┘ └───────────┘
```

---

## Technologie

### Backend

- **Node.js** - Środowisko wykonawcze
- **Express.js** - Framework webowy
- **Supabase** - Backend-as-a-Service (autoryzacja, baza danych)
- **JWT** - JSON Web Tokens do autoryzacji
- **Docker** - Konteneryzacja aplikacji
- **Docker Compose** - Orkiestracja kontenerów

### Frontend

- **Next.js 15** - Framework React z App Router
- **React 19** - Biblioteka UI
- **TypeScript** - Typowany JavaScript
- **Tailwind CSS** - Framework CSS
- **shadcn/ui** - Komponenty UI
- **Lucide React** - Ikony

### Narzędzia

- **http-proxy-middleware** - Proxy dla API Gateway
- **express-validator** - Walidacja danych
- **axios** - Klient HTTP

---

## Struktura Projektu

```
microservices-nextjs/
├── api-gateway/              # API Gateway service
│   ├── src/
│   │   ├── index.js
│   │   └── utils/
│   └── Dockerfile
│
├── services/
│   ├── auth-service/         # Mikroserwis autoryzacji
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── middleware/
│   │   │   └── utils/
│   │   └── Dockerfile
│   │
│   ├── crud-service/          # Mikroserwis CRUD
│   │   ├── src/
│   │   │   ├── index.js
│   │   │   ├── middleware/
│   │   │   └── utils/
│   │   └── Dockerfile
│   │
│   └── logging-service/       # Mikroserwis logowania
│       ├── src/
│       │   ├── index.js
│       │   ├── middleware/
│       │   └── utils/
│       └── Dockerfile
│
├── app/                       # Next.js App Router
│   ├── page.tsx              # Landing page
│   ├── auth/
│   │   ├── login/
│   │   ├── sign-up/
│   │   └── forgot-password/
│   ├── protected/            # Strony chronione
│   ├── items/                # Zarządzanie items
│   └── logs/                 # Widok logów
│
├── components/               # Komponenty React
│   ├── items-manager.tsx
│   ├── logs-viewer.tsx
│   ├── login-form.tsx
│   ├── sign-up-form.tsx
│   └── ui/                   # Komponenty shadcn/ui
│
├── lib/                      # Biblioteki pomocnicze
│   ├── api-client.ts         # Klient API
│   └── supabase/             # Konfiguracja Supabase
│
├── docker-compose.yml         # Konfiguracja Docker Compose
└── README.md
```

---

## Funkcjonalności

### 1. Autoryzacja i Uwierzytelnianie

#### Rejestracja Użytkownika

- Formularz rejestracji z walidacją
- Automatyczne potwierdzenie emaila
- Generowanie tokenu JWT po rejestracji
- Przechowywanie tokenu w localStorage i cookies

#### Logowanie

- Formularz logowania z walidacją
- Weryfikacja danych przez Supabase
- Generowanie tokenu JWT
- Automatyczne przekierowanie do strony chronionej

#### Zarządzanie Sesją

- Weryfikacja tokenu przez middleware
- Automatyczne przekierowanie przy braku autoryzacji
- Wylogowanie z czyszczeniem sesji

### 2. Zarządzanie Danymi (CRUD)

#### Tworzenie Rekordów

- Formularz tworzenia nowego itemu
- Walidacja danych po stronie klienta i serwera
- Automatyczne przypisanie do zalogowanego użytkownika
- Logowanie operacji

#### Przeglądanie Rekordów

- Lista wszystkich rekordów użytkownika
- Wyświetlanie szczegółów (tytuł, opis, data utworzenia)
- Filtrowanie i paginacja (opcjonalnie)

#### Edycja Rekordów

- Formularz edycji z wstępnie wypełnionymi danymi
- Aktualizacja tylko własnych rekordów użytkownika
- Automatyczne odświeżenie listy po edycji

#### Usuwanie Rekordów

- Modal potwierdzenia usunięcia
- Bezpieczne usuwanie z walidacją uprawnień
- Automatyczne odświeżenie listy po usunięciu

### 3. System Logowania

#### Rejestracja Akcji

- Automatyczne logowanie wszystkich operacji CRUD
- Logowanie logowań i rejestracji
- Przechowywanie informacji o IP, czasie i użytkowniku

#### Przeglądanie Logów

- Lista wszystkich logów systemowych
- Filtrowanie po użytkowniku
- Wyświetlanie szczegółów akcji
- Paginacja wyników

### 4. Interfejs Użytkownika

#### Tryb Jasny i Ciemny

- Przełącznik motywu
- Automatyczne wykrywanie preferencji systemowych
- Spójny design w obu trybach

---

## Opis Interfejsu Użytkownika

### Landing Page

Strona główna aplikacji prezentuje:

- Hero section z głównym nagłówkiem i przyciskami CTA
- Sekcję funkcjonalności z kartami opisującymi mikroserwisy
- Sekcję architektury systemu
- Footer z informacjami o projekcie

[widok_landing_page_light]
[widok_landing_page_dark]

### Strona Rejestracji

Formularz rejestracji zawiera:

- Pole na imię (opcjonalne)
- Pole na email (wymagane)
- Pole na hasło (wymagane)
- Pole na powtórzenie hasła (wymagane)
- Walidację danych w czasie rzeczywistym
- Link do strony logowania

[widok_strony_rejestracji]

### Strona Logowania

Formularz logowania zawiera:

- Pole na email
- Pole na hasło
- Link do resetowania hasła
- Link do strony rejestracji
- Automatyczne przekierowanie po zalogowaniu

[widok_strony_logowania]

### Strona Resetowania Hasła

Formularz resetowania hasła:

- Pole na email
- Wysyłka linku resetującego

[widok_strony_forgot_password]

### Strona Główna (Protected)

Po zalogowaniu użytkownik widzi:

- Informacje o zalogowanym użytkowniku
- Linki do głównych sekcji aplikacji
- Nawigację do Items i Logs

[widok_strony_home_protected]

### Zarządzanie Items

#### Pusta Lista

Po pierwszym zalogowaniu lista items jest pusta z zachętą do utworzenia pierwszego rekordu.

[widok_strony_items_management_pusta]

#### Formularz Tworzenia

Formularz do tworzenia nowego itemu:

- Pole "Title" (wymagane)
- Pole "Description" (opcjonalne)
- Przycisk "Create Item"

#### Lista z Rekordami

Po utworzeniu rekordów widoczna jest lista z:

- Tytułem i opisem każdego itemu
- Datą utworzenia
- Przyciskami "Edit" i "Delete"

[widok_strony_items_management_z_rekordem]

#### Edycja Rekordu

Po kliknięciu "Edit":

- Formularz wypełniony danymi rekordu
- Możliwość zmiany tytułu i opisu
- Przyciski "Save" i "Cancel"
- Formularz tworzenia jest wyłączony podczas edycji

[widok_strony_items_management_edycja]

#### Po Aktualizacji

Po zapisaniu zmian:

- Zaktualizowane dane widoczne na liście
- Komunikat potwierdzenia
- Formularz edycji zniknął

[widok_strony_items_management_po_edycji]

#### Modal Usuwania

Po kliknięciu "Delete":

- Modal z potwierdzeniem
- Wyświetlenie tytułu itemu do usunięcia
- Ostrzeżenie o nieodwracalności operacji
- Przyciski "Cancel" i "Delete"

[widok_strony_items_management_modal_usuwania]

### System Logs

Widok logów systemowych prezentuje:

- Listę wszystkich zarejestrowanych akcji
- Informacje o użytkowniku, akcji, serwisie
- Datę i czas wykonania
- Adres IP
- Szczegóły operacji
- Możliwość filtrowania i paginacji

[widok_strony_system_logs]

---

## API Endpoints

### API Gateway

Wszystkie żądania przechodzą przez API Gateway na porcie 3000.

#### Health Check

```
GET /health/all
```

Zwraca status wszystkich mikroserwisów.

### Auth Service

#### Rejestracja

```
POST /api/auth/register
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123",
  "name": "User Name"
}
```

**Odpowiedź:**

```json
{
  "message": "Użytkownik zarejestrowany pomyślnie",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  },
  "token": "jwt_token"
}
```

#### Logowanie

```
POST /api/auth/login
Content-Type: application/json

{
  "email": "user@example.com",
  "password": "password123"
}
```

**Odpowiedź:**

```json
{
  "message": "Logowanie pomyślne",
  "token": "jwt_token",
  "user": {
    "id": "uuid",
    "email": "user@example.com",
    "name": "User Name"
  }
}
```

### CRUD Service

Wszystkie endpointy wymagają nagłówka:

```
Authorization: Bearer {jwt_token}
```

#### Utworzenie Item

```
POST /api/items
Content-Type: application/json

{
  "title": "Item Title",
  "description": "Item Description"
}
```

#### Lista Items

```
GET /api/items?limit=50&offset=0
```

#### Pojedynczy Item

```
GET /api/items/{id}
```

#### Aktualizacja Item

```
PUT /api/items/{id}
Content-Type: application/json

{
  "title": "Updated Title",
  "description": "Updated Description"
}
```

#### Usunięcie Item

```
DELETE /api/items/{id}
```

### Logging Service

#### Lista Logów

```
GET /api/logs?limit=50&offset=0
Authorization: Bearer {jwt_token}
```

#### Logi Użytkownika

```
GET /api/logs/user?limit=50&offset=0
Authorization: Bearer {jwt_token}
```

#### Utworzenie Logu (wewnętrzne)

```
POST /api/logs
Content-Type: application/json

{
  "user_id": "uuid",
  "action": "CREATE_ITEM",
  "service": "crud-service",
  "details": "Created item with ID: xxx",
  "ip_address": "127.0.0.1"
}
```

---

## Baza Danych

System wykorzystuje Supabase (PostgreSQL) jako bazę danych. Wszystkie tabele są zarządzane przez Supabase z włączonym Row Level Security (RLS).

### Tabele

#### Tabela: items

Przechowuje rekordy utworzone przez użytkowników.

```sql
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title VARCHAR(200) NOT NULL,
  description TEXT,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ
);

-- RLS Policies
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can create their own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can update their own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can delete their own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);
```

#### Tabela: logs

Przechowuje logi wszystkich operacji systemowych.

```sql
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action VARCHAR(100) NOT NULL,
  service VARCHAR(50) NOT NULL,
  details TEXT,
  ip_address VARCHAR(45),
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- RLS Policies
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view all logs"
  ON logs FOR SELECT
  USING (true);

CREATE POLICY "Services can insert logs"
  ON logs FOR INSERT
  WITH CHECK (true);
```

[widok_tabela_logs_supabase]

---

## Testowanie

### Testy Manualne

#### 1. Rejestracja Użytkownika

1. Przejdź do strony rejestracji
2. Wypełnij formularz danymi testowymi
3. Kliknij "Sign Up"
4. Sprawdź komunikat sukcesu
5. Sprawdź logi w konsoli przeglądarki

[widok_logi_konsoli_rejestracja_logowanie]

#### 2. Logowanie

1. Przejdź do strony logowania
2. Wprowadź dane zarejestrowanego użytkownika
3. Kliknij "Sign In"
4. Sprawdź przekierowanie do strony chronionej
5. Sprawdź wyświetlenie powitania w navbarze

#### 3. Tworzenie Rekordu

1. Przejdź do sekcji "Items"
2. Wypełnij formularz tworzenia
3. Kliknij "Create Item"
4. Sprawdź pojawienie się rekordu na liście
5. Sprawdź logi w konsoli

[widok_logi_tworzenia_rekordu]

#### 4. Edycja Rekordu

1. Kliknij "Edit" przy wybranym rekordzie
2. Zmień dane w formularzu
3. Kliknij "Save"
4. Sprawdź zaktualizowane dane na liście

#### 5. Usuwanie Rekordu

1. Kliknij "Delete" przy wybranym rekordzie
2. Potwierdź w modalu
3. Sprawdź usunięcie rekordu z listy

#### 6. Przeglądanie Logów

1. Przejdź do sekcji "Logs"
2. Sprawdź listę wszystkich logów
3. Sprawdź szczegóły każdego logu

### Testy API

Można użyć skryptu testowego:

```bash
./test-all-functionalities.sh
```

Skrypt testuje wszystkie endpointy API i wyświetla wyniki.

---

## Logi i Monitorowanie

### Logi Konsoli

Wszystkie serwisy logują swoje działania do konsoli Docker. Logi zawierają:

- Poziom logowania (INFO, DEBUG, ERROR)
- Timestamp
- Szczegóły operacji
- Błędy i ostrzeżenia

[widok_logi_konsoli_rejestracja_logowanie]

### Logi w Bazie Danych

Wszystkie akcje są rejestrowane w tabeli `logs` w Supabase:

- Akcje użytkowników (CREATE, UPDATE, DELETE)
- Operacje autoryzacyjne (LOGIN, REGISTER)
- Żądania do API Gateway
- Informacje o IP i czasie

[widok_tabela_logs_supabase]

### Monitorowanie Kontenerów

Status kontenerów można monitorować przez:

- Docker Desktop
- `docker-compose ps`
- `docker-compose logs`

[widok_docker_desktop_kontenery_logi]
