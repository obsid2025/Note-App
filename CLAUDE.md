# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project Overview

Docmost is an open-source collaborative wiki and documentation software. It uses a monorepo architecture with pnpm workspaces and NX for build orchestration.

## Development Commands

```bash
# Start development (frontend + backend concurrently)
pnpm dev

# Build all packages
pnpm build

# Individual builds
pnpm client:build
pnpm server:build
pnpm editor-ext:build

# Database migrations
pnpm --filter server migration:create <name>
pnpm --filter server migration:up
pnpm --filter server migration:down
pnpm --filter server migration:latest
pnpm --filter server migration:redo
pnpm --filter server migration:codegen  # Generate TypeScript types from DB schema

# Testing
pnpm --filter server test              # Run all unit tests
pnpm --filter server test <pattern>    # Run tests matching pattern
pnpm --filter server test:watch        # Watch mode
pnpm --filter server test:e2e          # End-to-end tests

# Linting
pnpm --filter server lint
pnpm --filter client lint

# Collaboration server (separate process for real-time editing)
pnpm collab:dev

# Email template preview
pnpm email:dev
```

## Architecture

### Monorepo Structure

```
apps/
  client/    # React + Vite + Mantine UI frontend
  server/    # NestJS backend with Fastify
packages/
  editor-ext/  # TipTap editor extensions (shared between client and server)
```

### Server Path Aliases (apps/server)

- `@docmost/db/*` → `./src/database/*`
- `@docmost/transactional/*` → `./src/integrations/transactional/*`
- `@docmost/ee/*` → `./src/ee/*`

### Server (NestJS)

Core modules in `apps/server/src/`:
- `core/` - Business logic modules (auth, users, workspaces, spaces, pages, comments, attachments, groups, search, share, casl)
- `collaboration/` - Real-time collaborative editing via Hocuspocus/Yjs (runs as separate process)
- `ws/` - WebSocket gateway (Socket.IO) for live updates
- `integrations/` - External services (storage, mail, queue, redis, export/import, health, security, telemetry)
- `database/` - Kysely ORM setup, migrations, and type definitions

Key integrations:
- **Database**: PostgreSQL via Kysely ORM (type-safe SQL query builder)
- **Cache/Pub-Sub**: Redis via ioredis
- **Queue**: BullMQ for background jobs
- **Storage**: Local filesystem or S3-compatible
- **Mail**: SMTP or Postmark
- **Real-time**: Hocuspocus server with Yjs CRDT

### Client (React)

Located in `apps/client/src/`:
- `pages/` - Route components
- `features/` - Feature-specific components and logic
- `components/` - Shared UI components
- `lib/` - Utilities and API client (axios)
- `hooks/` - Custom React hooks

Key libraries:
- **UI**: Mantine v8
- **Editor**: TipTap with custom extensions from `@docmost/editor-ext`
- **State**: Jotai (atoms) + TanStack Query (server state)
- **Routing**: React Router v7
- **i18n**: i18next

### Routes Structure

Main authenticated routes:
- `/home` - Dashboard
- `/spaces` - Spaces listing
- `/s/:spaceSlug` - Space home
- `/s/:spaceSlug/p/:pageSlug` - Page editor
- `/settings/*` - Account and workspace settings

Public share routes:
- `/share/:shareId/p/:pageSlug` - Shared page view

## Enterprise Edition

EE features are in separate directories under a commercial license:
- `apps/server/src/ee/`
- `apps/client/src/ee/`
- `packages/ee/`

EE modules load dynamically via `require()` - the server gracefully handles their absence for open-source deployments.

## Environment Configuration

Required variables (see `.env.example`):
- `APP_URL` - Public URL (e.g., http://localhost:3000)
- `APP_SECRET` - Encryption key (min 32 chars, generate with `openssl rand -hex 32`)
- `DATABASE_URL` - PostgreSQL connection string
- `REDIS_URL` - Redis connection string

Optional:
- `STORAGE_DRIVER` - `local` (default) or `s3`
- `MAIL_DRIVER` - `smtp` (default) or `postmark`
- `JWT_TOKEN_EXPIRES_IN` - Token expiration (default: 30d)
- `FILE_UPLOAD_SIZE_LIMIT` - Max upload size (default: 50mb)
- `DEBUG_MODE` - Enable debug logging in production

## Database

- ORM: Kysely (type-safe SQL query builder)
- Migrations: Located in `apps/server/src/database/migrations/`
- Type generation: Run `pnpm --filter server migration:codegen` after schema changes to regenerate `src/database/types/db.d.ts`
