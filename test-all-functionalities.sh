#!/bin/bash

# Skrypt do testowania wszystkich funkcjonalności systemu
# Przygotowuje dane do screenshotów dokumentacji

API_GATEWAY="http://localhost:3000"
TIMESTAMP=$(date +%s)
TEST_EMAIL="demo-user-${TIMESTAMP}@example.com"
TEST_PASSWORD="Demo123456"
TEST_NAME="Demo User"

echo "=========================================="
echo "TEST WSZYSTKICH FUNKCJONALNOŚCI SYSTEMU"
echo "=========================================="
echo ""

# Kolory dla outputu
GREEN='\033[0;32m'
BLUE='\033[0;34m'
YELLOW='\033[1;33m'
NC='\033[0m' # No Color

# Funkcja pomocnicza do wyświetlania wyników
print_test() {
    echo -e "${BLUE}=== $1 ===${NC}"
}

print_success() {
    echo -e "${GREEN}✓ $1${NC}"
}

print_test "1. REJESTRACJA UŻYTKOWNIKA"
REGISTER_RESPONSE=$(curl -s -X POST "${API_GATEWAY}/api/auth/register" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\",\"name\":\"${TEST_NAME}\"}")
echo "$REGISTER_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$REGISTER_RESPONSE"
TOKEN=$(echo "$REGISTER_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
    print_success "Rejestracja zakończona sukcesem"
    echo "Email: ${TEST_EMAIL}"
    echo "Hasło: ${TEST_PASSWORD}"
    echo ""
else
    echo "Błąd rejestracji"
    exit 1
fi

sleep 1

print_test "2. LOGOWANIE UŻYTKOWNIKA"
LOGIN_RESPONSE=$(curl -s -X POST "${API_GATEWAY}/api/auth/login" \
    -H "Content-Type: application/json" \
    -d "{\"email\":\"${TEST_EMAIL}\",\"password\":\"${TEST_PASSWORD}\"}")
echo "$LOGIN_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$LOGIN_RESPONSE"
TOKEN=$(echo "$LOGIN_RESPONSE" | grep -o '"token":"[^"]*"' | cut -d'"' -f4)
if [ -n "$TOKEN" ]; then
    print_success "Logowanie zakończone sukcesem"
    echo "Token: ${TOKEN:0:50}..."
    echo ""
else
    echo "Błąd logowania"
    exit 1
fi

sleep 1

print_test "3. UTWORZENIE ITEM (CREATE)"
CREATE_RESPONSE=$(curl -s -X POST "${API_GATEWAY}/api/items" \
    -H "Content-Type: application/json" \
    -H "Authorization: Bearer ${TOKEN}" \
    -d '{"title":"Przykładowy Item","description":"To jest przykładowy item utworzony przez API Gateway"}')
echo "$CREATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$CREATE_RESPONSE"
ITEM_ID=$(echo "$CREATE_RESPONSE" | grep -o '"id":"[^"]*"' | head -1 | cut -d'"' -f4)
if [ -n "$ITEM_ID" ]; then
    print_success "Item utworzony pomyślnie"
    echo "Item ID: ${ITEM_ID}"
    echo ""
else
    echo "Błąd tworzenia item"
fi

sleep 1

print_test "4. ODCZYT WSZYSTKICH ITEMS (READ)"
READ_RESPONSE=$(curl -s -X GET "${API_GATEWAY}/api/items" \
    -H "Authorization: Bearer ${TOKEN}")
echo "$READ_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$READ_RESPONSE"
if echo "$READ_RESPONSE" | grep -q "items"; then
    print_success "Lista items pobrana pomyślnie"
    echo ""
fi

sleep 1

print_test "5. ODCZYT POJEDYNCZEGO ITEM (READ BY ID)"
if [ -n "$ITEM_ID" ]; then
    READ_ONE_RESPONSE=$(curl -s -X GET "${API_GATEWAY}/api/items/${ITEM_ID}" \
        -H "Authorization: Bearer ${TOKEN}")
    echo "$READ_ONE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$READ_ONE_RESPONSE"
    if echo "$READ_ONE_RESPONSE" | grep -q "id"; then
        print_success "Item pobrany pomyślnie"
        echo ""
    fi
fi

sleep 1

print_test "6. AKTUALIZACJA ITEM (UPDATE)"
if [ -n "$ITEM_ID" ]; then
    UPDATE_RESPONSE=$(curl -s -X PUT "${API_GATEWAY}/api/items/${ITEM_ID}" \
        -H "Content-Type: application/json" \
        -H "Authorization: Bearer ${TOKEN}" \
        -d '{"title":"Zaktualizowany Item","description":"Opis został zaktualizowany przez API"}')
    echo "$UPDATE_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$UPDATE_RESPONSE"
    if echo "$UPDATE_RESPONSE" | grep -q "zaktualizowany"; then
        print_success "Item zaktualizowany pomyślnie"
        echo ""
    fi
fi

sleep 1

print_test "7. USUNIĘCIE ITEM (DELETE)"
if [ -n "$ITEM_ID" ]; then
    DELETE_RESPONSE=$(curl -s -X DELETE "${API_GATEWAY}/api/items/${ITEM_ID}" \
        -H "Authorization: Bearer ${TOKEN}")
    echo "$DELETE_RESPONSE"
    if echo "$DELETE_RESPONSE" | grep -q "usunięty"; then
        print_success "Item usunięty pomyślnie"
        echo ""
    fi
fi

sleep 1

print_test "8. PRZEGLĄDANIE LOGÓW SYSTEMOWYCH"
LOGS_RESPONSE=$(curl -s -X GET "${API_GATEWAY}/api/logs?limit=10" \
    -H "Authorization: Bearer ${TOKEN}")
echo "$LOGS_RESPONSE" | python3 -m json.tool 2>/dev/null | head -60 || echo "$LOGS_RESPONSE" | head -c 1000
if echo "$LOGS_RESPONSE" | grep -q "logs"; then
    print_success "Logi pobrane pomyślnie"
    echo ""
fi

sleep 1

print_test "9. PRZEGLĄDANIE LOGÓW UŻYTKOWNIKA"
USER_LOGS_RESPONSE=$(curl -s -X GET "${API_GATEWAY}/api/logs/user?limit=5" \
    -H "Authorization: Bearer ${TOKEN}")
echo "$USER_LOGS_RESPONSE" | python3 -m json.tool 2>/dev/null | head -40 || echo "$USER_LOGS_RESPONSE" | head -c 800
if echo "$USER_LOGS_RESPONSE" | grep -q "logs"; then
    print_success "Logi użytkownika pobrane pomyślnie"
    echo ""
fi

echo ""
echo "=========================================="
echo -e "${GREEN}WSZYSTKIE TESTY ZAKOŃCZONE${NC}"
echo "=========================================="
echo ""
echo "Dane testowe:"
echo "  Email: ${TEST_EMAIL}"
echo "  Hasło: ${TEST_PASSWORD}"
echo "  Nazwa: ${TEST_NAME}"
echo ""
echo "Możesz teraz wykonać screenshoty w aplikacji Next.js:"
echo "  - Rejestracja: http://localhost:3004/signup"
echo "  - Logowanie: http://localhost:3004/login"
echo "  - Items: http://localhost:3004/items"
echo "  - Logi: http://localhost:3004/logs"
echo ""

