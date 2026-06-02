# MechanicBuddy

**Self-hosted workshop management for vehicle service centers.**

MechanicBuddy is an open-source platform for auto repair shops to manage work orders, clients, vehicles, inventory, and invoicing — including PDF estimate/invoice generation. It runs as a single-tenant self-hosted app or as a multi-tenant SaaS.

- 🌐 Website: https://mechanicbuddy.app/
- 📚 Documentation: https://docs.mechanicbuddy.app/

> This project is a fork of [CarCare](https://github.com/rene98c/carcareco) by rene98c.

---

## Features

- **Work orders** — repair jobs and offers/estimates, with assigned mechanics, odometer, and notes
- **Clients & vehicles** — company and private clients, vehicle profiles (VIN, reg. nr., make/model), service history
- **Inventory** — spare parts and services catalog with pricing
- **Invoicing** — generate offers, estimates, and invoices as PDFs; email delivery via SMTP
- **Multi-tenancy** — isolated database per tenant, with shared (free/demo) and dedicated (paid) deployment modes
- **Management portal** — admin dashboard for tenant provisioning, billing, and platform analytics

## Tech Stack

| Layer | Technology |
|-------|-----------|
| Backend API | .NET 9 (ASP.NET Core), NHibernate, JWT auth |
| Database | PostgreSQL 16+ (schema-isolated multitenancy) |
| Migrations | DbUp (SQL + C# scripts) |
| Frontend | Next.js 15 (App Router, React server components), TypeScript, Tailwind CSS |
| Management portal | Next.js 15, TypeScript, Stripe |
| Infra | Docker, Kubernetes, Helm, Argo CD, Ansible |

## Repository Layout

```
backend/            .NET 9 solution
  src/
    MechanicBuddy.Http.Api            ASP.NET Core Web API (entry point, controllers)
    MechanicBuddy.Core.Application    Business logic, auth, PDF printing, rate limiting
    MechanicBuddy.Core.Domain         Domain entities + repository interfaces
    MechanicBuddy.Core.Persistence.Postgres   NHibernate mappings, Postgres repositories
    MechanicBuddy.Http.Api.Model      Request/response DTOs
    MechanicBuddy.Management.Api       SaaS tenant-provisioning / management API
    DbUp / Management.DbUp             Database migrations
frontend/           Next.js 15 customer-facing app
management-portal/  Next.js 15 admin dashboard (SaaS operators)
infrastructure/     Helm charts, k8s overlays, Argo CD, Ansible
docs/               MkDocs documentation site
scripts/            Setup & tenant-provisioning helpers
```

---

## Quick Start (Docker)

Requires Docker and Docker Compose.

```bash
# 1. Generate secrets (first run only)
./scripts/setup-secrets.sh          # or scripts/setup-secrets.ps1 on Windows

# 2. Build and start all services
docker compose up --build -d
```

| Service | URL |
|---------|-----|
| Web UI | http://localhost:3025 |
| API (Swagger) | http://localhost:15567/swagger |
| Mail preview (MailHog) | http://localhost:8025 |

The stack runs Postgres, the DbUp migrator (runs to completion before the API starts), the API, the web frontend, and a MailHog mail catcher.

### Default login

```
Username: admin
Password: carcare
```

---

## Local Development

### Frontend

```bash
cd frontend
cp .env.example .env        # then fill in the values (see Configuration)
npm install
npm run dev                 # http://localhost:3000 (Turbopack)
npm run build               # production build
npm run lint
```

### Backend

```bash
# API
cd backend/src/MechanicBuddy.Http.Api
dotnet run

# Run database migrations
cd backend/src/DbUp
dotnet run

# Build the whole solution
cd backend/src
dotnet build MechanicBuddy.sln
```

---

## Configuration

**Backend** secrets live in `backend/src/MechanicBuddy.Http.Api/appsettings.Secrets.json`
(DB connection, JWT secret, SMTP settings). Generate them with `scripts/setup-secrets.sh`.

**Frontend** env vars (`frontend/.env`, copy from `.env.example`):

| Variable | Purpose |
|----------|---------|
| `SERVER_SECRET` | Must equal the backend's `ConsumerSecret` |
| `SESSION_SECRET` | Cookie-encryption key (random 32-byte base64) |
| `API_URL` | Backend endpoint used for server-side calls |
| `NEXT_PUBLIC_API_URL` | Backend endpoint for client-side resources |
| `NEXT_PUBLIC_SESSION_TIMEOUT` | Session lifetime (seconds) |

---

## Multi-Tenant Architecture

MechanicBuddy supports a hybrid deployment model. Every tenant gets its own database (even on shared instances); routing is driven by JWT claims.

- **Shared** (free/demo tiers) — tenants share API/Web services; each gets a separate database on a shared Postgres cluster. Provisioned via database creation + routing. `DeploymentMode: "shared"`.
- **Dedicated** (paid tiers) — each tenant gets a dedicated namespace (`tenant-{tenantId}`) with its own Postgres, API, and Web deployments via a full Helm chart. `DeploymentMode: "dedicated"`.

All tenants receive a `{tenantId}.mechanicbuddy.app` subdomain. See `CLAUDE.md` and `infrastructure/helm/charts/` for details, and `MechanicBuddy.Management.Api/Services/TenantProvisioningService.cs` for provisioning logic.

---

## Deployment & CI/CD

Production runs on Kubernetes via Helm charts (`infrastructure/helm/charts/`) and k8s overlays (`infrastructure/k8s/`), with Argo CD for GitOps continuous delivery.

GitHub Actions workflows (`.github/workflows/`):

- `backend-build.yml` / `frontend-build.yml` — build and publish container images
- `saas-deploy.yml` — build & deploy the SaaS environment
- `gitops-deploy.yml` — update image tags in k8s overlays (Argo CD syncs the rollout)

Commit-message flags:
- `[skip-backend]` — skip the backend build
- `[skip-frontend]` — skip the frontend build

---

## Documentation

Full docs are built with MkDocs (`docs/`) and published at https://docs.mechanicbuddy.app/. Includes a user guide, technical reference, and screenshots.

## License

Licensed under the **GNU Affero General Public License v3.0** (AGPL-3.0). See [LICENSE](LICENSE).
