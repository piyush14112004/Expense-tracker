# Expense Tracker API Documentation

## Base URL

```text
http://localhost:8080/api
```

The frontend runs at `http://localhost:5173`. The API uses session cookies to keep the user signed in.

## Authentication

### Register

Create a new user account. New accounts receive the `USER` role.

- **Method:** `POST`
- **Endpoint:** `/auth/register`
- **Access:** Public
- **Success response:** `201 Created`

Request body:

```json
{
  "name": "Your Name",
  "email": "you@example.com",
  "password": "choose-a-password"
}
```

Example success response:

```json
{
  "id": 1,
  "name": "Your Name",
  "email": "you@example.com",
  "role": "USER"
}
```

### Login

Sign in and start a session.

- **Method:** `POST`
- **Endpoint:** `/auth/login`
- **Access:** Public
- **Success response:** `200 OK`

Request body:

```json
{
  "email": "you@example.com",
  "password": "choose-a-password"
}
```

The response contains the account ID, name, email, and role. The session cookie is used for later requests.

### Current User

Get the currently signed-in account.

- **Method:** `GET`
- **Endpoint:** `/auth/me`
- **Access:** Signed-in users
- **Success response:** `200 OK`

Example response:

```json
{
  "id": 1,
  "name": "Your Name",
  "email": "you@example.com",
  "role": "USER"
}
```

### Logout

End the current session.

- **Method:** `POST`
- **Endpoint:** `/auth/logout`
- **Access:** Signed-in users
- **Success response:** `204 No Content`

## Expenses

All expense endpoints require a signed-in user. Users can access only their own expenses.

### List Expenses

- **Method:** `GET`
- **Endpoint:** `/expenses`
- **Success response:** `200 OK`

Example response:

```json
[
  {
    "id": 1,
    "description": "Lunch",
    "amount": 250.00,
    "category": "Food",
    "date": "2026-10-20"
  }
]
```

### Add Expense

- **Method:** `POST`
- **Endpoint:** `/expenses`
- **Success response:** `201 Created`

Request body:

```json
{
  "description": "Lunch",
  "amount": 250.00,
  "category": "Food",
  "date": "2026-10-20"
}
```

Fields:

- `description`: required; maximum 120 characters
- `amount`: required; must be greater than zero
- `category`: required; maximum 40 characters
- `date`: required; format `YYYY-MM-DD`

### Delete Expense

- **Method:** `DELETE`
- **Endpoint:** `/expenses/{id}`
- **Success response:** `204 No Content`

Example:

```text
DELETE /api/expenses/1
```

A user cannot delete another user's expense.

## Admin

### Admin Summary

Return the total number of registered accounts.

- **Method:** `GET`
- **Endpoint:** `/admin/summary`
- **Access:** Admin only
- **Success response:** `200 OK`

Example response:

```json
{
  "message": "Admin access granted",
  "totalUsers": 1
}
```

A signed-in `USER` who requests an admin-only route receives `403 Forbidden`.

## Validation and Errors

Invalid request fields return `400 Bad Request` with an error message. For example:

```json
{
  "error": "amount: must be greater than 0"
}
```

Registering an email that is already in use returns `400 Bad Request`. Incorrect login details are rejected, and the frontend displays a friendly message.

## Notes

- Passwords are stored as BCrypt hashes, not plain text.
- Session-based requests must include the session cookie.
- Never share database passwords, account passwords, or session cookies.