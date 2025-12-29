# System Mikroserwisów z Next.js i Supabase

Kompleksowy system mikroserwisów składający się z trzech niezależnych serwisów komunikujących się poprzez API Gateway oraz aplikacji klienta Next.js.

> 📖 **Pełna dokumentacja projektu dostępna w pliku [DOKUMENTACJA.md](./DOKUMENTACJA.md)**

## 📋 Spis treści

- [Szybki Start](#szybki-start)
- [Architektura](#architektura)
- [Wymagania](#wymagania)
- [Instalacja](#instalacja)
- [Uruchomienie](#uruchomienie)
- [API Endpoints](#api-endpoints)
- [Dokumentacja](#dokumentacja)

## 🏗️ Architektura

System składa się z następujących komponentów:

```
┌─────────────────┐
│  Next.js Client │
│   (Port 3004)   │
└────────┬────────┘
         │
         ▼
┌─────────────────┐
│   API Gateway   │
│   (Port 3000)   │
└────────┬────────┘
         │
    ┌────┴────┬──────────┬─────────────┐
    ▼         ▼          ▼             ▼
┌────────┐ ┌──────┐ ┌──────────┐ ┌──────────┐
│  Auth  │ │ CRUD │ │ Logging  │ │ Supabase │
│Service │ │Service│ │ Service  │ │   DB    │
│ :3001  │ │ :3002│ │  :3003   │ │          │
└────────┘ └──────┘ └──────────┘ └──────────┘
```

### Komponenty

1. **Auth Service** (Port 3001)

   - Rejestracja i logowanie użytkowników
   - Generowanie i weryfikacja JWT przez Supabase
   - Wykorzystuje Supabase Auth API

2. **CRUD Service** (Port 3002)

   - Pełne operacje CRUD na danych (items)
   - Własna tabela w Supabase
   - Autoryzacja przez JWT

3. **Logging Service** (Port 3003)

   - Rejestrowanie działań użytkowników i systemu
   - Odczyt logów z filtrowaniem
   - Własna tabela w Supabase

4. **API Gateway** (Port 3000)

   - Centralny punkt komunikacji
   - Routing do mikroserwisów
   - Automatyczne logowanie żądań

5. **Next.js Client** (Port 3004)
   - Interfejs użytkownika
   - Komunikacja przez API Gateway
   - Komponenty: Login, Signup, CRUD, Logs

## 📦 Wymagania

- Node.js 20+
- npm lub yarn
- Konto Supabase (darmowe)
- Docker i Docker Compose (opcjonalnie)

## 🚀 Instalacja

### 1. Klonowanie i instalacja zależności

```bash
# Instalacja zależności dla klienta Next.js
npm install

# Instalacja zależności dla mikroserwisów
cd services/auth-service && npm install && cd ../..
cd services/crud-service && npm install && cd ../..
cd services/logging-service && npm install && cd ../..
cd api-gateway && npm install && cd ..
```

### 2. Konfiguracja Supabase

1. Utwórz projekt na [Supabase](https://supabase.com)
2. Przejdź do SQL Editor i wykonaj następujące zapytania:

```sql
-- Tabela items dla CRUD Service
CREATE TABLE items (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  title TEXT NOT NULL,
  description TEXT,
  user_id UUID REFERENCES auth.users(id) ON DELETE CASCADE,
  created_at TIMESTAMPTZ DEFAULT NOW(),
  updated_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security dla items
ALTER TABLE items ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can only see their own items"
  ON items FOR SELECT
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only insert their own items"
  ON items FOR INSERT
  WITH CHECK (auth.uid() = user_id);

CREATE POLICY "Users can only update their own items"
  ON items FOR UPDATE
  USING (auth.uid() = user_id);

CREATE POLICY "Users can only delete their own items"
  ON items FOR DELETE
  USING (auth.uid() = user_id);

-- Tabela logs dla Logging Service
CREATE TABLE logs (
  id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
  user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  action TEXT NOT NULL,
  service TEXT NOT NULL,
  details TEXT,
  ip_address TEXT,
  created_at TIMESTAMPTZ DEFAULT NOW()
);

-- Row Level Security dla logs
ALTER TABLE logs ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view their own logs"
  ON logs FOR SELECT
  USING (auth.uid() = user_id OR user_id IS NULL);

-- Funkcja do automatycznego aktualizowania updated_at
CREATE OR REPLACE FUNCTION update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = NOW();
  RETURN NEW;
END;
$$ language 'plpgsql';

CREATE TRIGGER update_items_updated_at BEFORE UPDATE ON items
  FOR EACH ROW EXECUTE FUNCTION update_updated_at_column();
```

## ⚙️ Konfiguracja

### Zmienne środowiskowe

#### Client (Next.js) - `.env.local`

```env
NEXT_PUBLIC_SUPABASE_URL=your_supabase_url
NEXT_PUBLIC_SUPABASE_ANON_KEY=your_supabase_anon_key
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
```

#### Auth Service - `services/auth-service/.env`

```env
PORT=3001
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
SUPABASE_ANON_KEY=your_supabase_anon_key  # Opcjonalne, ale zalecane dla automatycznego logowania po rejestracji
```

#### CRUD Service - `services/crud-service/.env`

```env
PORT=3002
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### Logging Service - `services/logging-service/.env`

```env
PORT=3003
SUPABASE_URL=your_supabase_url
SUPABASE_SERVICE_ROLE_KEY=your_supabase_service_role_key
```

#### API Gateway - `api-gateway/.env`

```env
PORT=3000
AUTH_SERVICE_URL=http://localhost:3001
CRUD_SERVICE_URL=http://localhost:3002
LOGGING_SERVICE_URL=http://localhost:3003
```

## 🚀 Szybki Start

### Uruchomienie z Docker Compose (Zalecane)

```bash
# 1. Skonfiguruj zmienne środowiskowe
cp .env.example .env
# Edytuj .env i dodaj swoje klucze Supabase

# 2. Uruchom mikroserwisy i API Gateway
docker-compose up -d

# 3. W osobnym terminalu uruchom aplikację Next.js
npm install
npm run dev

# 4. Otwórz aplikację
# http://localhost:3004
```

### Weryfikacja

```bash
# Sprawdź status wszystkich serwisów
curl http://localhost:3000/health/all

# Sprawdź status kontenerów
docker-compose ps
```

## 🎯 Uruchomienie

### Opcja 1: Docker Compose (Zalecane)

```bash
# Uruchom wszystkie mikroserwisy
docker-compose up -d

# Uruchom aplikację Next.js
npm run dev
```

### Opcja 2: Uruchomienie lokalne

```bash
# Terminal 1 - Auth Service
cd services/auth-service && npm run dev

# Terminal 2 - CRUD Service
cd services/crud-service && npm run dev

# Terminal 3 - Logging Service
cd services/logging-service && npm run dev

# Terminal 4 - API Gateway
cd api-gateway && npm run dev

# Terminal 5 - Next.js Client
npm run dev
```

## 📁 Struktura projektu

```
microservices-nextjs/
├── app/                    # Next.js App Router
│   ├── auth/               # Strony autoryzacji
│   ├── protected/          # Chronione strony
│   ├── items/              # Zarządzanie items
│   └── logs/               # Podgląd logów
├── components/             # Komponenty React
│   ├── items-manager.tsx   # CRUD dla items
│   ├── logs-viewer.tsx     # Podgląd logów
│   └── ui/                 # shadcn/ui komponenty
├── lib/
│   ├── api-client.ts       # Klient API Gateway
│   └── supabase/           # Supabase clients
├── services/
│   ├── auth-service/       # Mikroserwis autoryzacji
│   ├── crud-service/       # Mikroserwis CRUD
│   └── logging-service/    # Mikroserwis logów
├── api-gateway/            # API Gateway
└── docker-compose.yml      # Docker orchestracja
```

## 🔌 API Endpoints

### API Gateway (http://localhost:3000)

#### Auth Endpoints

- `POST /api/auth/register` - Rejestracja użytkownika
- `POST /api/auth/login` - Logowanie
- `POST /api/auth/verify` - Weryfikacja tokenu

#### CRUD Endpoints (wymagają autoryzacji)

- `GET /api/items` - Lista items
- `GET /api/items/:id` - Pojedynczy item
- `POST /api/items` - Utworzenie item
- `PUT /api/items/:id` - Aktualizacja item
- `DELETE /api/items/:id` - Usunięcie item

#### Logs Endpoints (wymagają autoryzacji)

- `GET /api/logs` - Lista logów
- `GET /api/logs/user/:userId` - Logi użytkownika

#### Health Checks

- `GET /health` - Status API Gateway
- `GET /health/all` - Status wszystkich serwisów

## 🗄️ Bazy danych

Wszystkie dane przechowywane są w Supabase:

- **auth.users** - Użytkownicy (zarządzane przez Supabase Auth)
- **public.items** - Dane CRUD (z RLS)
- **public.logs** - Logi systemowe (z RLS)

## 📝 Funkcjonalności

✅ Rejestracja i logowanie użytkowników  
✅ Generowanie i weryfikacja JWT przez Supabase  
✅ Pełne operacje CRUD na danych  
✅ Rejestrowanie działań użytkowników/systemu  
✅ Odczyt logów z filtrowaniem  
✅ API Gateway z routingiem i autoryzacją  
✅ Nowoczesny interfejs użytkownika (Next.js)  
✅ Row Level Security w Supabase  
✅ Docker Compose dla łatwego uruchomienia  
✅ Tryb jasny i ciemny  
✅ Responsywny design

## 🛠️ Technologie

- **Frontend**: Next.js 15, React 19, TypeScript, Tailwind CSS, shadcn/ui
- **Backend**: Node.js, Express.js
- **Database**: Supabase (PostgreSQL)
- **Auth**: Supabase Auth (JWT)
- **API Gateway**: http-proxy-middleware
- **Containerization**: Docker, Docker Compose

## 📚 Dokumentacja

- **[DOKUMENTACJA.md](./DOKUMENTACJA.md)** - Pełna dokumentacja projektu z opisem funkcjonalności, interfejsu użytkownika, API endpoints i instrukcjami

## 🧪 Testowanie

Uruchom skrypt testowy:

```bash
./test-all-functionalities.sh
```

Lub przetestuj manualnie:

1. Rejestracja: `/auth/sign-up`
2. Logowanie: `/auth/login`
3. CRUD: `/items`
4. Logi: `/logs`

## 📄 Licencja

MIT
