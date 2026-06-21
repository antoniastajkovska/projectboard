# ProjectBoard

ProjectBoard is a full-stack project and task management app with:

- Frontend: React
- Backend: Spring Boot
- Database: PostgreSQL
- Authentication: JWT with BCrypt password hashing

## Features

- Register, login, and logout
- Create, edit, delete, and view projects
- Add, edit, delete, and complete tasks
- Private data access per logged-in user
- Seed data for quick local testing

## Repository Layout

- `frontend/` - React UI
- `backend/` - Spring Boot API
- `backend/src/main/resources/db/migration/` - PostgreSQL schema and seed data

## Prerequisites

- Node.js 18+ for the frontend
- Java 21 for the backend
- PostgreSQL 14+ or compatible

## Database Setup

Create a PostgreSQL database named `projectboard`, or update the backend datasource properties to match your local database.

The schema and seed data are managed by Flyway:

- `backend/src/main/resources/db/migration/V1__schema.sql`
- `backend/src/main/resources/db/migration/V2__seed_data.sql`

## Backend Setup

1. Make sure PostgreSQL is running.
2. Update `backend/src/main/resources/application.properties` if needed:
   - `spring.datasource.url`
   - `spring.datasource.username`
   - `spring.datasource.password`
   - `projectboard.jwt.secret`
3. Start the API from the `backend/` directory:

```bash
./mvnw spring-boot:run
```

On Windows you can use:

```powershell
.\mvnw.cmd spring-boot:run
```

The backend runs on `http://localhost:8080`.

## Frontend Setup

1. Go to the `frontend/` directory.
2. Install dependencies if needed:

```bash
npm install
```

3. Start the UI:

```bash
npm start
```

The frontend runs on `http://localhost:3000`.

## API URL

The frontend uses `http://localhost:8080/api` by default.

If your backend is hosted elsewhere, set:

```bash
REACT_APP_API_URL=https://your-api.example.com/api
```

## Default Seed User

The seed script creates a sample account:

- Email: `anton@example.com`
- Password: `password123`

## Notes

- JWT tokens are stored in `localStorage`.
- Protected requests automatically include the bearer token.
- Each user only sees their own projects and tasks.
