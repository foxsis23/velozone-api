#!/usr/bin/env bash
# Test Auth API with curl
# Usage: bash test-api.sh
# Make sure the server is running: npm start

BASE="http://localhost:3000/api"
ACCESS_TOKEN=""
REFRESH_TOKEN=""

echo "════════════════════════════════════════"
echo "  Auth API — curl test script"
echo "════════════════════════════════════════"

# ─── 1. Register ─────────────────────────────────────────────────────────────
echo ""
echo "1. POST /auth/register"
curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"testuser","email":"test@example.com","password":"Secret123","passwordConfirm":"Secret123"}' | python3 -m json.tool 2>/dev/null || cat

# ─── 2. Register – password mismatch (should fail) ────────────────────────────
echo ""
echo "2. POST /auth/register — password mismatch (expects 422)"
curl -s -X POST "$BASE/auth/register" \
  -H "Content-Type: application/json" \
  -d '{"username":"x","email":"x@x.com","password":"Secret123","passwordConfirm":"Wrong"}' | python3 -m json.tool 2>/dev/null || cat

# ─── 3. Login ─────────────────────────────────────────────────────────────────
echo ""
echo "3. POST /auth/login"
RESPONSE=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"Secret123"}')
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
ACCESS_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['accessToken'])" 2>/dev/null)
REFRESH_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['refreshToken'])" 2>/dev/null)
echo "  → AccessToken: ${ACCESS_TOKEN:0:40}..."
echo "  → RefreshToken: $REFRESH_TOKEN"

# ─── 4. Login – wrong password (should fail) ──────────────────────────────────
echo ""
echo "4. POST /auth/login — wrong password (expects 401)"
curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"WrongPass1"}' | python3 -m json.tool 2>/dev/null || cat

# ─── 5. Get profile (protected route) ────────────────────────────────────────
echo ""
echo "5. GET /users/me — protected route"
curl -s "$BASE/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool 2>/dev/null || cat

# ─── 6. Get profile without token (should fail) ──────────────────────────────
echo ""
echo "6. GET /users/me — no token (expects 401)"
curl -s "$BASE/users/me" | python3 -m json.tool 2>/dev/null || cat

# ─── 7. Update profile ────────────────────────────────────────────────────────
echo ""
echo "7. PATCH /users/me — update username"
curl -s -X PATCH "$BASE/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username":"updateduser"}' | python3 -m json.tool 2>/dev/null || cat

# ─── 8. Refresh token ─────────────────────────────────────────────────────────
echo ""
echo "8. POST /auth/refresh"
REFRESH_RESPONSE=$(curl -s -X POST "$BASE/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}")
echo "$REFRESH_RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$REFRESH_RESPONSE"
NEW_ACCESS=$(echo "$REFRESH_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['accessToken'])" 2>/dev/null)
NEW_REFRESH=$(echo "$REFRESH_RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['refreshToken'])" 2>/dev/null)
[ -n "$NEW_ACCESS" ] && ACCESS_TOKEN="$NEW_ACCESS"
[ -n "$NEW_REFRESH" ] && REFRESH_TOKEN="$NEW_REFRESH"

# ─── 9. Change password ───────────────────────────────────────────────────────
echo ""
echo "9. POST /auth/change-password"
curl -s -X POST "$BASE/auth/change-password" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"currentPassword":"Secret123","newPassword":"NewSecret456","newPasswordConfirm":"NewSecret456"}' | python3 -m json.tool 2>/dev/null || cat

# ─── 10. Re-login with new password ──────────────────────────────────────────
echo ""
echo "10. POST /auth/login — re-login with new password"
RESPONSE=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"NewSecret456"}')
echo "$RESPONSE" | python3 -m json.tool 2>/dev/null || echo "$RESPONSE"
ACCESS_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['accessToken'])" 2>/dev/null)
REFRESH_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['refreshToken'])" 2>/dev/null)

# ─── 11. Forgot password ─────────────────────────────────────────────────────
echo ""
echo "11. POST /auth/forgot-password"
curl -s -X POST "$BASE/auth/forgot-password" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com"}' | python3 -m json.tool 2>/dev/null || cat

# ─── 12. Admin route (should be forbidden for normal user) ────────────────────
echo ""
echo "12. GET /users — admin only route (expects 403 for regular user)"
curl -s "$BASE/users" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool 2>/dev/null || cat

# ─── 13. Logout ──────────────────────────────────────────────────────────────
echo ""
echo "13. POST /auth/logout"
curl -s -X POST "$BASE/auth/logout" \
  -H "Authorization: Bearer $ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}" | python3 -m json.tool 2>/dev/null || cat

# ─── 14. Use revoked refresh token (should fail) ──────────────────────────────
echo ""
echo "14. POST /auth/refresh — revoked token (expects 401)"
curl -s -X POST "$BASE/auth/refresh" \
  -H "Content-Type: application/json" \
  -d "{\"refreshToken\":\"$REFRESH_TOKEN\"}" | python3 -m json.tool 2>/dev/null || cat

# ─── 15. Delete own account ───────────────────────────────────────────────────
echo ""
echo "15. DELETE /users/me — re-login then delete account"
RESPONSE=$(curl -s -X POST "$BASE/auth/login" \
  -H "Content-Type: application/json" \
  -d '{"email":"test@example.com","password":"NewSecret456"}')
ACCESS_TOKEN=$(echo "$RESPONSE" | python3 -c "import sys,json; d=json.load(sys.stdin); print(d['data']['accessToken'])" 2>/dev/null)
curl -s -X DELETE "$BASE/users/me" \
  -H "Authorization: Bearer $ACCESS_TOKEN" | python3 -m json.tool 2>/dev/null || cat

echo ""
echo "════════════════════════════════════════"
echo "  Tests complete"
echo "════════════════════════════════════════"
