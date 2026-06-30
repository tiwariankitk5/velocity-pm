# Architecture

Velocity PM uses a monorepo so the frontend, backend, and shared contracts evolve together.

## Request Flow

1. Next.js sends REST requests through `src/lib/api.ts`.
2. Express validates payloads with Zod.
3. Auth middleware verifies JWT access tokens.
4. Route handlers call Mongoose models.
5. Socket.io broadcasts task, chat, and presence events to project/workspace rooms.

## Backend Modules

- `config`: environment validation and database connection
- `middleware`: auth, RBAC, and centralized errors
- `models`: MongoDB schemas for core SaaS data
- `routes`: REST endpoints grouped by product domain
- `services`: AI and token boundaries
- `sockets`: realtime collaboration events

## Frontend Modules

- `app`: Next.js routes and layouts
- `components`: providers and shared UI pieces
- `lib`: API client
- `store`: Zustand client state

## Security Notes

- Passwords are hashed with bcrypt.
- Access tokens are short-lived by design.
- RBAC is modeled at workspace membership level.
- Helmet, CORS, JSON limits, and rate limiting are enabled.
- Production should store refresh tokens as hashed session records and use secure HTTP-only cookies.
