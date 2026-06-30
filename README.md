# Velocity PM: AI Project Management SaaS

Velocity PM is a production-shaped full-stack SaaS project for learning and demonstrating modern web development. It combines workspace management, project boards, task tracking, realtime collaboration, analytics, and AI-assisted planning.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, React Query, Zustand
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose
- Auth: JWT access tokens, refresh-token-ready architecture, bcrypt
- Realtime: Socket.io
- AI: OpenAI-ready service boundary with local fallback output
- DevOps: Docker Compose, GitHub Actions, monorepo workspaces

## Project Structure

```txt
apps/
  api/      Express API, MongoDB models, auth, sockets, AI services
  web/      Next.js application UI
packages/
  shared/   Shared TypeScript DTOs and enums
docs/       Architecture, database design, roadmap
docker/     Dockerfiles
.github/    CI workflow
```

## Local Setup

1. Copy `.env.example` to `.env`.
2. Start MongoDB locally or use Docker Compose.
3. Install dependencies:

```bash
npm install
```

4. Start both apps:

```bash
npm run dev
```

- Web: http://localhost:3000
- API: http://localhost:4000/health

On Windows PowerShell, use `npm.cmd` if scripts are blocked by execution policy.

## Current MVP Features

- Signup and login API
- JWT-protected user profile route
- Workspace creation and member role model
- Project creation and listing
- Task creation, updates, status, priority, labels, due dates
- AI task description and project summary endpoints
- Socket.io task update, chat, and presence events
- SaaS dashboard UI with Kanban board, analytics, chat, AI panel
- Login/signup UI connected to API client

## Next Build Milestones

1. Add refresh token persistence and rotation.
2. Add email verification and forgot password mail provider.
3. Add Google OAuth.
4. Implement invitations acceptance flow.
5. Add comments, attachments, notifications, and activity logs.
6. Connect dashboard to live API data.
7. Add tests for auth, RBAC, projects, and tasks.
8. Deploy web to Vercel and API to Render/Fly.io.
