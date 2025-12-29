# 🐳 Instrukcja uruchomienia przez Docker Compose

## Krok 1: Utwórz plik `.env` w głównym katalogu projektu

Docker Compose automatycznie czyta zmienne środowiskowe z pliku `.env` w głównym katalogu projektu.

```bash
# Skopiuj przykładowy plik
cp .env.example .env

# Edytuj .env i wstaw swoje wartości Supabase
nano .env  # lub użyj swojego edytora
```

### Wymagane zmienne w `.env`:

```env
# Supabase Configuration (wymagane)
SUPABASE_URL=https://twoj-projekt.supabase.co
SUPABASE_SERVICE_ROLE_KEY=twoj_service_role_key

# Opcjonalne (dla automatycznego logowania po rejestracji)
SUPABASE_ANON_KEY=twoj_anon_key
```

**Gdzie znaleźć te wartości:**

1. Przejdź do [Supabase Dashboard](https://app.supabase.com)
2. Wybierz swój projekt
3. Przejdź do **Settings** → **API**
4. Skopiuj:
   - **Project URL** → `SUPABASE_URL`
   - **service_role key** (sekretny!) → `SUPABASE_SERVICE_ROLE_KEY`
   - **anon/public key** → `SUPABASE_ANON_KEY`

## Krok 2: Skonfiguruj Next.js Client (`.env.local`)

Klient Next.js potrzebuje osobnego pliku `.env.local`:

```bash
# Skopiuj z my.env.example lub utwórz nowy
cp my.env.example .env.local

# Edytuj .env.local
nano .env.local
```

### Wymagane zmienne w `.env.local`:

```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
NEXT_PUBLIC_SUPABASE_URL=https://twoj-projekt.supabase.co
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY=twoj_anon_key
NEXT_PUBLIC_SUPABASE_PUBLISHABLE_OR_ANON_KEY=twoj_anon_key
```

## Krok 3: Uruchom Docker Compose

```bash
# Uruchom wszystkie mikroserwisy i API Gateway
docker-compose up --build

# Lub w tle:
docker-compose up -d --build
```

To uruchomi:

- ✅ Auth Service na porcie 3001
- ✅ CRUD Service na porcie 3002
- ✅ Logging Service na porcie 3003
- ✅ API Gateway na porcie 3000

## Krok 4: Uruchom Next.js Client (w osobnym terminalu)

```bash
# W głównym katalogu projektu
npm install  # jeśli jeszcze nie zainstalowano
npm run dev
```

Klient Next.js będzie dostępny na `http://localhost:3000` (lub innym porcie jeśli 3000 jest zajęty przez API Gateway).

## ⚠️ Ważne uwagi

1. **Porty:**

   - API Gateway: `3000`
   - Auth Service: `3001`
   - CRUD Service: `3002`
   - Logging Service: `3003`
   - Next.js Client: `3000` (konflikt!) → użyj innego portu lub zatrzymaj API Gateway

2. **Rozwiązanie konfliktu portów:**

   Jeśli Next.js i API Gateway chcą używać portu 3000:

   **Opcja A:** Zmień port Next.js w `package.json`:

   ```json
   "scripts": {
     "dev": "next dev -p 3004"
   }
   ```

   **Opcja B:** Uruchom Next.js lokalnie, a mikroserwisy przez Docker:

   ```bash
   # Tylko mikroserwisy w Docker
   docker-compose up

   # Next.js lokalnie (w osobnym terminalu)
   npm run dev
   ```

3. **Sprawdzenie statusu:**

   ```bash
   # Zobacz logi wszystkich serwisów
   docker-compose logs -f

   # Zobacz status
   docker-compose ps

   # Sprawdź health check API Gateway
   curl http://localhost:3000/health/all
   ```

4. **Zatrzymanie:**
   ```bash
   docker-compose down
   ```

## 🔍 Troubleshooting

### Problem: Serwisy nie mogą połączyć się z Supabase

**Rozwiązanie:** Sprawdź czy w `.env` są poprawne wartości:

```bash
# Sprawdź czy zmienne są ustawione
docker-compose config
```

### Problem: Port już zajęty

**Rozwiązanie:** Zmień porty w `docker-compose.yml` lub zatrzymaj inne aplikacje.

### Problem: Błędy w logach

**Rozwiązanie:** Sprawdź logi konkretnego serwisu:

```bash
docker-compose logs auth-service
docker-compose logs crud-service
docker-compose logs logging-service
docker-compose logs api-gateway
```

## 📝 Podsumowanie

1. ✅ Utwórz `.env` w root z zmiennymi Supabase
2. ✅ Utwórz `.env.local` dla Next.js
3. ✅ Uruchom `docker-compose up --build`
4. ✅ Uruchom `npm run dev` w osobnym terminalu
5. ✅ Otwórz przeglądarkę i przetestuj aplikację!
