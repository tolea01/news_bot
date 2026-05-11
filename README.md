# News Bot (Telegram)

A Telegram bot built with **TypeScript**, **Telegraf**, and **Prisma** that searches news through NewsAPI, stores results in PostgreSQL, and delivers them to users with pagination.

## Table of Contents
- [Features](#features)
- [Architecture](#architecture)
- [Tech Stack](#tech-stack)
- [Requirements](#requirements)
- [Environment Variables](#environment-variables)
- [Run Locally](#run-locally)
- [Run with Docker](#run-with-docker)
- [Database and Prisma](#database-and-prisma)
- [Bot Commands](#bot-commands)
- [Observability and Logging](#observability-and-logging)
- [Testing](#testing)
- [Project Structure](#project-structure)
- [Roadmap](#roadmap)

## Features
- User onboarding through the `/start` command.
- User persistence in PostgreSQL.
- News search by keyword.
- Filtering of already stored news (by title).
- Bulk insert for new articles.
- Paginated chat results for better UX.
- Runtime modes:
  - **development**: polling
  - **production**: webhook
- Health-check endpoint: `GET /health`.

## Architecture
Main flow:
1. User starts the bot using `/start`.
2. Bot creates or fetches the user from the database.
3. User clicks “🔍 Search news” and sends a keyword.
4. `NewsService` queries NewsAPI (`/everything`, language `ro`).
5. New articles are saved in PostgreSQL through Prisma.
6. Bot sends paginated results back to the user.

### Core modules
- **Bot layer** (`src/bot`) — Telegraf initialization and command handlers.
- **Service layer** (`src/services`) — business logic for users and news.
- **Config layer** (`src/config`) — environment variable loading.
- **Persistence layer** (`prisma/`, `src/db`) — schema and DB access.
- **Utility layer** (`src/utils`) — pagination and logging.

## Tech Stack
- **Runtime:** Node.js
- **Language:** TypeScript
- **Bot framework:** Telegraf
- **HTTP client:** Axios
- **ORM:** Prisma
- **Database:** PostgreSQL
- **Logging:** Winston
- **Containerization:** Docker + Docker Compose

## Requirements
- Node.js 20+
- npm 10+
- PostgreSQL 15+ (or run via Docker)
- Telegram bot token (BotFather)
- NewsAPI key

## Environment Variables
Create a `.env` file in the project root:

```env
NODE_ENV=development
APP_PORT=3000

BOT_API_KEY=your_telegram_bot_token
NEWS_API_KEY=your_newsapi_key

DATABASE_URL=postgresql://postgres:postgres@localhost:5555/news_bot

POSTGRES_USER=postgres
POSTGRES_PASSWORD=postgres
POSTGRES_DB=news_bot

PG_EMAIL=admin@example.com
PG_PASSWORD=admin

WEBHOOK_URL=https://your-domain.example.com
```

> `WEBHOOK_URL` is required only for production/webhook mode.

## Run Locally
```bash
npm install
npx prisma generate
npm run dev
```

Production build:
```bash
npm run build
npm run start
```

## Run with Docker
```bash
docker compose up --build
```

Available services:
- App: `http://localhost:3000`
- PostgreSQL: `localhost:5555`
- pgAdmin: `http://localhost:7777`

## Database and Prisma
The schema includes:
- `User`
- `News`
- `NewsRead` (many-to-many relation between users and read news)

Useful commands:
```bash
npx prisma generate
npx prisma migrate dev
npx prisma studio
```

## Bot Commands
- `/start` — creates/reuses the user and shows the main menu.
- `🔍 Search news` — starts keyword-based news search.
- Pagination navigation — through callback buttons (implemented in pagination utility).

## Observability and Logging
Structured logs are used for:
- application startup;
- command initialization;
- NewsAPI requests;
- data persistence;
- error handling.

Recommendation: ship logs to an aggregator (e.g., ELK/Loki) in production.

## Testing
There is one news service test in:
- `tests/newsService.test.ts`

If you add a test framework (e.g., Jest/Vitest), it is recommended to define scripts in `package.json`:
- `test`
- `test:watch`
- `test:coverage`

## Project Structure
```text
src/
  app.ts
  bot/
    bot.ts
    commands/
      start.ts
      searchNews.ts
  config/
    config.service.ts
  db/
    db.config.ts
  interfaces/
    command.interface.ts
  services/
    news/
    user/
  utils/
    logger.ts
    pagination.ts
prisma/
  schema.prisma
tests/
```

## Roadmap
- [ ] Implement “Read news” (`read_news`) feature.
- [ ] Add rate limiting / anti-spam for user input.
- [ ] Add stronger query validation and sanitization.
- [ ] Add complete unit and integration tests.
- [ ] Add CI pipeline (lint, test, build).
- [ ] Extend observability (metrics + tracing).

## CI/CD
This project includes GitHub Actions workflows:
- **CI** (`.github/workflows/ci.yml`) runs on push/PR and validates:
  - dependency installation (`npm ci`)
  - Prisma client generation (`npx prisma generate`)
  - TypeScript build (`npm run build`)
- **CD** (`.github/workflows/cd.yml`) runs on `main` and publishes a Docker image to **GitHub Container Registry (GHCR)**.

Image naming convention:
- `ghcr.io/<owner>/<repo>:latest`
- `ghcr.io/<owner>/<repo>:sha-<commit>`

> To pull private GHCR images, authenticate with a token that has `read:packages` permission.

