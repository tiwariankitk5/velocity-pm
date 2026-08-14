# Velocity PM: AI Project Management SaaS

Velocity PM is a production-shaped full-stack SaaS project for learning and demonstrating modern web development. It combines workspace management, project boards, task tracking, realtime collaboration, analytics, and AI-assisted planning.

## Tech Stack

- Frontend: Next.js, React, TypeScript, Tailwind CSS, React Query, Zustand
- Backend: Node.js, Express, TypeScript, MongoDB, Mongoose
- Auth: JWT access tokens, refresh-token-ready architecture, bcrypt
- Realtime: Socket.io
- AI: OpenAI-ready service boundary with local fallback output
- DevOps: Docker Compose, GitHub Actions, monorepo workspaces

## Architecture & Features

Velocity PM is a production-grade full-stack SaaS project management tool.

### Features
- **Authentication**: JWT Access & Refresh Token rotation, secure HTTP-only cookies, password reset flows.
- **RBAC & Multi-tenant**: Workspaces with strict Owner/Admin/Member roles.
- **Kanban Board**: Real-time project tracking with drag-and-drop.
- **Real-time Collaboration**: Socket.io backed task updates and chat, secured with JWT socket middleware.
- **AI Planning**: Task generation and Project summaries powered by OpenAI boundaries.

### Tech Stack
- Frontend: Next.js (App Router), React Query, Zustand, Tailwind CSS.
- Backend: Express, Mongoose, Socket.io, Zod.
- CI/CD: GitHub Actions, Docker Compose.

## Environment Variables

Copy `.env.example` to `.env` and set the following:
```
PORT=4000
NODE_ENV=development
CLIENT_URL=http://localhost:3000
DATABASE_URL=mongodb://localhost:27017/velocity
JWT_ACCESS_SECRET=your_super_secret_access_key
JWT_REFRESH_SECRET=your_super_secret_refresh_key
JWT_ACCESS_EXPIRES_IN=15m
JWT_REFRESH_EXPIRES_IN=7d
OPENAI_API_KEY=optional_ai_key
```

## Local Development

Start everything with Docker Compose (recommended):
```bash
docker-compose up --build
```
Or locally:
```bash
npm install
npm run dev
```

## Deployment

1. **Database**: Provision a MongoDB Atlas cluster.
2. **Backend**: Deploy `apps/api` to Render or Fly.io as a Node Web Service. Set all Env Vars.
3. **Frontend**: Deploy `apps/web` to Vercel. Set `NEXT_PUBLIC_API_URL` to your backend URL.
