# Dokumentacja Projektu - System Mikroserwisów z API Gateway

## Spis Treści

1. [Wprowadzenie](#wprowadzenie)
2. [Architektura Systemu](#architektura-systemu)
3. [Technologie](#technologie)
4. [Struktura Projektu](#struktura-projektu)
5. [Funkcjonalności](#funkcjonalności)
8. [Opis Interfejsu Użytkownika](#opis-interfejsu-użytkownika)
9. [API Endpoints](#api-endpoints)
10. [Baza Danych](#baza-danych)
11. [Logi i Monitorowanie](#logi-i-monitorowanie)

---

## Wprowadzenie

Projekt przedstawia kompleksowy system mikroserwisów zbudowany w architekturze rozproszonej, komunikujący się poprzez centralny API Gateway. System składa się z trzech niezależnych mikroserwisów (Autoryzacja, CRUD, Logowanie) oraz aplikacji klienckiej zbudowanej w Next.js.

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

<img width="3360" height="4224" alt="screencapture-localhost-3004-2025-12-29-10_07_50" src="https://github.com/user-attachments/assets/d80fd914-d01f-4fac-941e-60adfa8ddb0d" />
<img width="3360" height="4224" alt="screencapture-localhost-3004-2025-12-29-10_08_23" src="https://github.com/user-attachments/assets/3d03262c-fdac-4fab-8f91-b88cc25c0859" />


### Strona Rejestracji

Formularz rejestracji zawiera:

- Pole na imię (opcjonalne)
- Pole na email (wymagane)
- Pole na hasło (wymagane)
- Pole na powtórzenie hasła (wymagane)
- Walidację danych w czasie rzeczywistym
- Link do strony logowania

<img width="1680" height="924" alt="Screenshot 2025-12-29 at 09 33 20" src="https://github.com/user-attachments/assets/de8b8622-884c-4424-ac13-72704c5ea599" />

### Strona Logowania

Formularz logowania zawiera:

- Pole na email
- Pole na hasło
- Link do resetowania hasła
- Link do strony rejestracji
- Automatyczne przekierowanie po zalogowaniu

<img width="1680" height="924" alt="Screenshot 2025-12-29 at 09 33 06" src="https://github.com/user-attachments/assets/5cdf166c-0a83-4eec-bf13-af9759f91ab8" />

### Strona Resetowania Hasła

Formularz resetowania hasła:

- Pole na email
- Wysyłka linku resetującego

<img width="1680" height="924" alt="Screenshot 2025-12-29 at 09 33 13" src="https://github.com/user-attachments/assets/49f3dc6b-d31b-4bea-8656-9b1569836b24" />

### Strona Główna (Protected)

Po zalogowaniu użytkownik widzi:

- Informacje o zalogowanym użytkowniku
- Linki do głównych sekcji aplikacji
- Nawigację do Items i Logs

<img width="1680" height="924" alt="Screenshot 2025-12-29 at 09 54 02" src="https://github.com/user-attachments/assets/369aa206-a484-44e2-85ac-8e236d1262e7" />

### Zarządzanie Items

#### Pusta Lista

Po pierwszym zalogowaniu lista items jest pusta z zachętą do utworzenia pierwszego rekordu.

<img width="1680" height="924" alt="Screenshot 2025-12-29 at 09 31 04" src="https://github.com/user-attachments/assets/64c2b4ef-6d79-40f3-a54b-d46a405829a4" />

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

<img width="1680" height="924" alt="Screenshot 2025-12-29 at 09 54 39" src="https://github.com/user-attachments/assets/5c43a7cb-6da3-4988-920d-6809d5149a02" />

#### Edycja Rekordu

Po kliknięciu "Edit":

- Formularz wypełniony danymi rekordu
- Możliwość zmiany tytułu i opisu
- Przyciski "Save" i "Cancel"
- Formularz tworzenia jest wyłączony podczas edycji

<img width="1680" height="924" alt="Screenshot 2025-12-29 at 09 58 21" src="https://github.com/user-attachments/assets/1240f467-7ce8-46e4-8b3f-a5d4f944de45" />

#### Po Aktualizacji

Po zapisaniu zmian:

- Zaktualizowane dane widoczne na liście
- Komunikat potwierdzenia
- Formularz edycji zniknął

<img width="1680" height="924" alt="Screenshot 2025-12-29 at 09 58 48" src="https://github.com/user-attachments/assets/0f007109-9ab2-4de1-ad8e-81a2e13f1f16" />

#### Modal Usuwania

Po kliknięciu "Delete":

- Modal z potwierdzeniem
- Wyświetlenie tytułu itemu do usunięcia
- Ostrzeżenie o nieodwracalności operacji
- Przyciski "Cancel" i "Delete"

<img width="1680" height="924" alt="Screenshot 2025-12-29 at 10 01 50" src="https://github.com/user-attachments/assets/adcbce03-50cd-4daa-9d99-54c8a86410d0" />

### System Logs

Widok logów systemowych prezentuje:

- Listę wszystkich zarejestrowanych akcji
- Informacje o użytkowniku, akcji, serwisie
- Datę i czas wykonania
- Szczegóły operacji
- Możliwość filtrowania i paginacji

<img width="1680" height="924" alt="Screenshot 2025-12-29 at 10 02 26" src="https://github.com/user-attachments/assets/4c0d1c50-82f8-4cb4-b293-c7bf117024f8" />

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

**Pola:**

- `id` (UUID) - Unikalny identyfikator rekordu (klucz główny)
- `title` (VARCHAR 200) - Tytuł itemu (wymagane)
- `description` (TEXT) - Opis itemu (opcjonalne)
- `user_id` (UUID) - Identyfikator użytkownika (relacja z auth.users)
- `created_at` (TIMESTAMPTZ) - Data i czas utworzenia
- `updated_at` (TIMESTAMPTZ) - Data i czas ostatniej aktualizacji

**Row Level Security:**

- Użytkownicy mogą przeglądać tylko swoje własne rekordy
- Użytkownicy mogą tworzyć, aktualizować i usuwać tylko swoje własne rekordy

#### Tabela: logs

Przechowuje logi wszystkich operacji systemowych.

**Pola:**

- `id` (UUID) - Unikalny identyfikator logu (klucz główny)
- `user_id` (UUID) - Identyfikator użytkownika (opcjonalne, NULL dla akcji systemowych)
- `action` (VARCHAR 100) - Typ akcji (np. CREATE_ITEM, LOGIN, REGISTER)
- `service` (VARCHAR 50) - Nazwa serwisu, który wykonał akcję (auth-service, crud-service, api-gateway)
- `details` (TEXT) - Szczegółowe informacje o akcji (opcjonalne)
- `ip_address` (VARCHAR 45) - Adres IP żądania (opcjonalne)
- `created_at` (TIMESTAMPTZ) - Data i czas wykonania akcji

**Row Level Security:**

- Wszyscy użytkownicy mogą przeglądać logi
- Serwisy mogą dodawać nowe logi

---

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

<img width="1095" height="665" alt="Screenshot 2025-12-29 at 09 26 04" src="https://github.com/user-attachments/assets/b22cc16a-918f-4bfc-87a2-ef1fe9e6c8fd" />
<img width="1095" height="394" alt="Screenshot 2025-12-29 at 09 25 19" src="https://github.com/user-attachments/assets/689f98df-9898-43e5-868f-120503e7e17f" />
<img width="1082" height="221" alt="Screenshot 2025-12-29 at 09 42 48" src="https://github.com/user-attachments/assets/2a5ffa71-3d35-447c-a300-1be2f27651c0" />


### Logi w Bazie Danych

Wszystkie akcje są rejestrowane w tabeli `logs` w Supabase:

- Akcje użytkowników (CREATE, UPDATE, DELETE)
- Operacje autoryzacyjne (LOGIN, REGISTER)
- Żądania do API Gateway
- Informacje o IP i czasie

<img width="1792" height="1077" alt="Screenshot 2025-12-29 at 09 23 56" src="https://github.com/user-attachments/assets/a687071c-d400-47f3-98ec-f419b33fe53d" />

### Monitorowanie Kontenerów

Status kontenerów można monitorować przez:

- Docker Desktop
- `docker-compose ps`
- `docker-compose logs`

<img width="1792" height="1077" alt="Screenshot 2025-12-29 at 07 57 26" src="https://github.com/user-attachments/assets/e5f2fbc2-b247-456c-b1cd-0a4c2ed349b5" />
