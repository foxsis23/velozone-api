# API Testing Guide

Base URL: `http://localhost:3000`
mysql -u root velozone-api

---

## Auth Endpoints

### Register
```bash
curl -s -X POST http://localhost:3000/api/auth/register \
  -H "Content-Type: application/json" \
  -d '{
    "username": "testuser",
    "email": "test@example.com",
    "password": "Secret123",
    "passwordConfirm": "Secret123"
  }'
```

### Login
```bash
curl -s -X POST http://localhost:3000/api/auth/login \
  -H "Content-Type: application/json" \
  -d '{
    "email": "test@example.com",
    "password": "Secret123"
  }'
```

### Logout
```bash
curl -s -X POST http://localhost:3000/api/auth/logout \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "REFRESH_TOKEN"}'
```

### Refresh Access Token
```bash
curl -s -X POST http://localhost:3000/api/auth/refresh \
  -H "Content-Type: application/json" \
  -d '{"refreshToken": "REFRESH_TOKEN"}'
```

### Change Password
```bash
curl -s -X POST http://localhost:3000/api/auth/change-password \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{
    "currentPassword": "Secret123",
    "newPassword": "NewSecret456",
    "newPasswordConfirm": "NewSecret456"
  }'
```

---

## Email Verification

### 1. Get token from DB
```sql
SELECT email, email_token, email_token_expires FROM Users WHERE email = 'test@example.com';
```

### 2. Verify email
```
GET http://localhost:3000/api/auth/verify-email?token=TOKEN_FROM_DB
```
```bash
curl -s "http://localhost:3000/api/auth/verify-email?token=TOKEN_FROM_DB"
```

### Resend verification email
```bash
curl -s -X POST http://localhost:3000/api/auth/resend-verification \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

---

## Password Recovery

### 1. Request reset link
```bash
curl -s -X POST http://localhost:3000/api/auth/forgot-password \
  -H "Content-Type: application/json" \
  -d '{"email": "test@example.com"}'
```

### 2. Get token from DB
```sql
SELECT email, reset_token, reset_token_expires FROM Users WHERE email = 'test@example.com';
```

### 3. Reset password
```bash
curl -s -X POST "http://localhost:3000/api/auth/reset-password?token=TOKEN_FROM_DB" \
  -H "Content-Type: application/json" \
  -d '{
    "password": "NewSecret789",
    "passwordConfirm": "NewSecret789"
  }'
```

---

## Google OAuth

### 1. Open in browser (starts OAuth flow)
```
http://localhost:3000/api/auth/google
```

### 2. After redirect — tokens appear on the callback page
```
http://localhost:3000/oauth/callback?accessToken=...&refreshToken=...
```

### 3. Use the access token
```bash
curl -s http://localhost:3000/api/users/me \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

---

## User Profile

### Get profile
```bash
curl -s http://localhost:3000/api/users/me \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

### Update profile
```bash
curl -s -X PATCH http://localhost:3000/api/users/me \
  -H "Authorization: Bearer ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"username": "newname"}'
```

### Delete own account
```bash
curl -s -X DELETE http://localhost:3000/api/users/me \
  -H "Authorization: Bearer ACCESS_TOKEN"
```

---

## Admin Endpoints

> Requires a user with `role = 'admin'`. Set via SQL:
> ```sql
> UPDATE Users SET role = 'admin' WHERE email = 'test@example.com';
> ```

### List all users
```bash
curl -s http://localhost:3000/api/users \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

### Change user role
```bash
curl -s -X PATCH http://localhost:3000/api/users/USER_ID/role \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN" \
  -H "Content-Type: application/json" \
  -d '{"role": "admin"}'
```

### Delete user (admin)
```bash
curl -s -X DELETE http://localhost:3000/api/users/USER_ID \
  -H "Authorization: Bearer ADMIN_ACCESS_TOKEN"
```

---

## Health Check

```bash
curl -s http://localhost:3000/health
```

---

## Useful SQL queries

```sql
-- View all users
SELECT id, username, email, role, is_email_verified FROM Users;

-- View refresh tokens
SELECT * FROM RefreshTokens WHERE is_revoked = 0;

-- View login attempts
SELECT * FROM LoginAttempts ORDER BY createdAt DESC LIMIT 20;

-- Manually verify email
UPDATE Users SET is_email_verified = 1, email_token = NULL WHERE email = 'test@example.com';

-- Make admin
UPDATE Users SET role = 'admin' WHERE email = 'test@example.com';

-- Get email/reset tokens
SELECT email, email_token, reset_token FROM Users;
```
