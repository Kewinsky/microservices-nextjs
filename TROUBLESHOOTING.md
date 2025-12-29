# 🔧 Troubleshooting - Problemy z komunikacją

## Problem: Formularz signup nie działa

### Krok 1: Sprawdź konsolę przeglądarki

Otwórz DevTools (F12) i sprawdź:
- **Console** - czy są błędy JavaScript?
- **Network** - czy żądanie do `/api/auth/register` jest wysyłane?
  - Jaki status code?
  - Jaka odpowiedź?

### Krok 2: Sprawdź czy API Gateway działa

```bash
# Sprawdź health check
curl http://localhost:3000/health/all

# Sprawdź czy endpoint auth działa
curl -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test"}'
```

### Krok 3: Sprawdź zmienne środowiskowe

W pliku `.env.local` (dla Next.js):
```env
NEXT_PUBLIC_API_GATEWAY_URL=http://localhost:3000
```

**WAŻNE:** Jeśli Next.js działa na porcie 3000, a API Gateway też na 3000, będzie konflikt!

**Rozwiązanie:** Zmień port Next.js w `package.json`:
```json
"scripts": {
  "dev": "next dev -p 3004"
}
```

### Krok 4: Sprawdź logi Docker

```bash
# Zobacz logi API Gateway
docker-compose logs api-gateway

# Zobacz logi Auth Service
docker-compose logs auth-service

# Zobacz wszystkie logi
docker-compose logs -f
```

### Krok 5: Sprawdź CORS

Jeśli widzisz błąd CORS w konsoli:
- Sprawdź czy API Gateway ma `cors()` middleware
- Sprawdź czy wszystkie serwisy mają `cors()` middleware

### Krok 6: Test bezpośredni do Auth Service

```bash
# Test bezpośrednio do Auth Service (pomijając Gateway)
curl -X POST http://localhost:3001/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"test123","name":"Test"}'
```

Jeśli to działa, problem jest w API Gateway routing.

### Krok 7: Sprawdź routing w API Gateway

W `api-gateway/src/index.js` powinno być:
```javascript
app.use('/api/auth', logRequest, createProxyMiddleware({
  target: AUTH_SERVICE,
  changeOrigin: true,
  pathRewrite: {
    '^/api/auth': '/api/auth'
  },
  ...
}));
```

### Najczęstsze problemy:

1. **Port zajęty** - Next.js i API Gateway na tym samym porcie
2. **Błędny URL** - `NEXT_PUBLIC_API_GATEWAY_URL` wskazuje na zły adres
3. **CORS** - brak konfiguracji CORS w serwisach
4. **Routing** - błędna konfiguracja proxy w API Gateway
5. **Supabase** - brak lub błędne klucze w `.env` dla mikroserwisów

