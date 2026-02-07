# Micro-Frontend Platform

A containerized micro-frontend architecture where each page/route is an independent service with its own tech stack and database.

## Architecture

```
                    ┌─────────────┐
                    │    Nginx    │ :80
                    │   Gateway   │
                    └──────┬──────┘
                           │
              ┌────────────┴────────────┐
              ▼                         ▼
      ┌──────────────┐          ┌──────────────┐
      │   /booking   │          │  /catalogue  │
      │   Express    │          │   FastAPI    │
      │   EJS + JS   │          │  Jinja2 + JS │
      └──────┬───────┘          └──────┬───────┘
             │                         │
      ┌──────▼───────┐          ┌──────▼───────┐
      │   MongoDB    │          │   MongoDB    │
      └──────────────┘          └──────────────┘
```

## Key Concepts

- **Page-level micro-frontends** - Each route (`/booking`, `/catalogue`) is a separate service
- **Tech stack freedom** - Services can use different languages/frameworks
- **Shared UI via JS** - Navigation and common styles from a single source (`packages/shared/`)
- **Isolated databases** - Each service owns its data

## Quick Start

```bash
docker-compose up --build
```

Then visit:
- http://localhost/booking
- http://localhost/catalogue

## Project Structure

```
├── docker-compose.yml
├── nginx/                  # Gateway routing
├── packages/shared/        # Shared CSS, JS (navigation, auth, events)
└── services/
    ├── booking/            # Node.js + Express + EJS
    └── catalogue/          # Python + FastAPI + Jinja2
```

## Adding a New Micro-Frontend

1. Create service in `services/`
2. Add to `docker-compose.yml`
3. Add route in `nginx/nginx.conf`
4. Add nav link in `packages/shared/html/header.html`
