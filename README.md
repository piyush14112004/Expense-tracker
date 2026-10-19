# Expense Tracker

A personal finance app for creating an account, recording expenses, and viewing your spending total. Each user can view and manage their own expenses.

## Features

- User registration and login
- Password encryption with BCrypt
- Session-based authentication, session restore, and logout
- Role-based access for user and admin routes
- Add, view, and delete expenses
- Per-user expense data
- MySQL database integration
- Input validation and API error handling
- Responsive React interface

## Tech Stack

**Frontend:** React, Vite, JavaScript, CSS  
**Backend:** Java 17, Spring Boot, Spring Security, Spring Data JPA, Maven  
**Database:** MySQL

## Project Structure

```text
Expense-Tracker-Starter/
├── backend/
│   ├── src/main/java/com/kinetrexa/expensetracker/
│   │   ├── auth/
│   │   ├── common/
│   │   ├── config/
│   │   └── expense/
│   └── src/main/resources/application.yml
├── frontend/
│   └── src/
└── docs/

```

## Prerequisites

- Java 17
- Maven
- Node.js and npm
- MySQL Server and MySQL Workbench

## Database Setup

Create the database in MySQL:

```sql
CREATE DATABASE expense_tracker;
```

Set the database URL, username, and password in:

```text
backend/src/main/resources/application.yml
```

Use your local MySQL password there. Do not publish database passwords or other secrets to GitHub.

The backend uses Hibernate to create or update its tables when it starts. The main tables are:

- `user_accounts` — user name, email, encrypted password, and role
- `expenses` — description, amount, category, date, and owning user

## Run the Backend

Open a terminal in the project folder and run:

```powershell
cd backend
mvn spring-boot:run
```

The backend runs at `http://localhost:8080`. Keep this terminal open while using the app.

## Run the Frontend

Open a second terminal in the project folder and run:

```powershell
cd frontend
npm install
npm run dev
```

Open the Vite URL shown in the terminal, normally `http://localhost:5173`. Keep this terminal open too.

## API Endpoints

All API endpoints use the base URL `http://localhost:8080/api`.

| Method | Endpoint | Purpose | Access |
|---|---|---|---|
| POST | `/auth/register` | Create an account | Public |
| POST | `/auth/login` | Sign in | Public |
| POST | `/auth/logout` | End the current session | Signed in |
| GET | `/auth/me` | Get the signed-in account | Signed in |
| GET | `/expenses` | List the signed-in user's expenses | Signed in |
| POST | `/expenses` | Add an expense | Signed in |
| DELETE | `/expenses/{id}` | Delete an owned expense | Signed in |
| GET | `/admin/summary` | Get admin summary | Admin |

### Example: Register

```json
{
  "name": "Your Name",
  "email": "you@example.com",
  "password": "choose-a-password"
}
```

### Example: Add an Expense

```json
{
  "description": "Lunch",
  "amount": 250.00,
  "category": "Food",
  "date": "2026-10-20"
}
```

Amounts must be positive. The date format is `YYYY-MM-DD`.

## Roles

- Newly registered accounts receive the `USER` role.
- The `/api/admin/**` routes require the `ADMIN` role.
- A normal user should receive `403 Forbidden` when requesting an admin-only route.

## Project Status

The app runs locally with React, Spring Boot, and MySQL. Add these links after publishing:

- **GitHub:** Add public repository link
- **Live application:** Add deployment link, if deployed