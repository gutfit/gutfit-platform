# 🚀 Aura BrandOS: Production Handoff and RooCode Deployment Guide

**Author**: Manus AI
**Date**: October 22, 2025
**Project**: Aura: The Sentient Brand Ecosystem

---

## 🎯 Executive Summary: Production Readiness

The Aura BrandOS architecture has been comprehensively reviewed, streamlined, and extended to a **battle-ready, production-grade microservices platform**. The core vision of a "Sentient Brand Ecosystem" is realized through a decoupled, event-driven architecture that ensures high scalability, resilience, and maintainability.

The final package is structured for seamless deployment using RooCode's infrastructure-as-code capabilities, specifically targeting a **Kubernetes-native environment** with GPU acceleration for AI workloads.

| Component | Status | Key Improvement |
| :--- | :--- | :--- |
| **Architecture** | Production-Ready | Decoupled Microservices (Directus, AI Orchestrator, Genesis Engine) with Redis/Bull for event-driven async processing. |
| **AI/ML** | Extended | Added **Aura Genesis Engine** for Predictive Brand Evolution and Autonomous A/B Testing. |
| **Security** | Hardened | Implemented JWT-based access control, rate limiting, file upload hooks with malware scanning integration, and a clear API key management strategy. |
| **Observability** | Comprehensive | Integrated Prometheus, Grafana, and Loki for metrics, dashboards, and structured logging across all services. |
| **DevOps** | Automated | Full CI/CD pipeline defined (GitHub Actions) covering testing, multi-service Docker image build/push, and Kubernetes deployment/migration. |
| **Resilience** | Robust | Implemented Circuit Breakers for external dependencies and a centralized error handling middleware. |
| **Data** | Structured | Detailed PostgreSQL schema with performance indexes, migration scripts, and a full backup/restore strategy. |

---

## 1. 🏗️ Final System Architecture Overview

The system is organized into a cohesive set of microservices communicating primarily via a Redis-backed event bus (Bull queues) and internal HTTP APIs.

### 1.1. Microservices Map

| Service | Technology | Role | Dependencies |
| :--- | :--- | :--- | :--- |
| **Directus Core** | Node.js/PostgreSQL | Headless CMS, DAM, Primary API Gateway, User Auth. | PostgreSQL, Redis, AI Orchestrator (via HTTP hook) |
| **AI Orchestrator** | Node.js/Python | Manages all AI validation jobs (ColorGuard, LogoSentinel, etc.). | Redis (Bull), Brand Memory, Directus (for asset data) |
| **Design Sync** | Node.js | Real-time synchronization with Design Tools (Penpot, Inkscape). | Redis, Directus, AI Orchestrator |
| **Compliance Guardian** | Node.js | Auto-healing and rule enforcement. | AI Orchestrator, Directus (for revisions) |
| **Brand Memory** | Node.js/Qdrant/Neo4j | Vector database (Qdrant) for embeddings and Knowledge Graph (Neo4j) for relational brand rules. | Qdrant, Neo4j, Redis |
| **Genesis Engine** | Node.js/Python | **The Autonomous Brand Evolution Engine.** Handles predictive analysis and genetic algorithms. | AI Orchestrator, Brand Memory, Market Data APIs |

### 1.2. Data Flow for Core Asset Validation

1.  **User Uploads Asset** to **Directus Core**.
2.  **Directus Hook** (`asset-upload-hook.js`) performs security checks (malware scan, file size, auth) and then posts a job to the Redis/Bull queue.
3.  **AI Orchestrator** picks up the validation job from the queue.
4.  **AI Orchestrator** fetches asset data from Directus and brand rules from **Brand Memory**.
5.  **AI Orchestrator** runs validation in parallel using its micro-agents (e.g., ColorGuard, LogoSentinel).
6.  **AI Orchestrator** aggregates results and updates the asset's `compliance_score` and `violations` in **Directus**.
7.  If non-compliant, **Compliance Guardian** may be triggered to suggest or apply auto-healing fixes.

---

## 2. ⚙️ RooCode Deployment Instructions

The deployment is designed for a Kubernetes cluster, leveraging the provided `infra/kubernetes/` manifests.

### 2.1. Prerequisites

1.  **Kubernetes Cluster**: A running cluster with `kubectl` access.
2.  **GPU Support**: Nodes must be configured with NVIDIA GPU drivers and the NVIDIA device plugin for Kubernetes to support the AI Orchestrator and Genesis Engine deployments (e.g., GKE with `nvidia-tesla-t4` or similar).
3.  **Secrets Management**: A secure method (e.g., Vault, Kubernetes Secrets) to inject the critical environment variables listed in Section 3.

### 2.2. Deployment Steps

The deployment process is defined in the CI/CD pipeline (`.github/workflows/deploy.yml`) and can be executed via a single `kubectl apply`.

**Step 1: Create Secrets**

Create a Kubernetes Secret containing all sensitive environment variables (from Section 3.1) and API keys.

```bash
# Example for a generic secret creation
kubectl create secret generic aura-secrets \
    --from-literal=DB_ENCRYPTION_KEY='<YOUR_32_BYTE_KEY>' \
    --from-literal=JWT_SECRET='<YOUR_64_CHAR_SECRET>' \
    --from-literal=REDIS_PASSWORD='<STRONG_PASSWORD>' \
    --from-literal=AI_ORCHESTRATOR_KEY='<SERVICE_KEY>' \
    # ... include all other secrets
```

**Step 2: Deploy Infrastructure Services**

Deploy the core infrastructure (PostgreSQL, Redis, Qdrant, Neo4j, Prometheus/Loki).

```bash
kubectl apply -f infra/kubernetes/infra-stack.yaml
```

**Step 3: Run Database Migrations**

A dedicated job must run the initial schema creation and migration before the Directus service starts.

```bash
# Assuming the Directus image has been built and pushed to the registry
kubectl apply -f infra/kubernetes/migration-job.yaml
```

**Step 4: Deploy Aura Microservices**

Deploy the application services (Directus, AI Orchestrator, Design Sync, etc.).

```bash
kubectl apply -f infra/kubernetes/aura-deployment.yaml
```

**Step 5: Finalize and Expose**

Configure an Ingress resource (not provided, depends on cluster setup) to expose the Directus Core API (port 8055) and the Grafana dashboard (port 3000) via a Load Balancer with SSL termination.

---

## 3. 🔐 Production Environment and Secrets Checklist

### 3.1. Critical Environment Variables (Must be Secret)

| Variable | Service(s) | Description | Example/Requirement |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | All | Set to production. | `production` |
| `SECRET` | Directus | Directus application secret. | `64-character_random_string` |
| `JWT_SECRET` | Directus, All | Shared secret for internal JWTs. | `64-character_random_string` |
| `DB_ENCRYPTION_KEY` | Directus | Key for encrypting sensitive data fields. | `32-byte_random_key` |
| `POSTGRES_PASSWORD` | PostgreSQL, All | Strong password for the database user. | `StrongP@ssw0rd123` |
| `REDIS_PASSWORD` | Redis, All | Strong password for Redis access. | `StrongR3d1sP@ss` |
| `AI_ORCHESTRATOR_KEY` | Directus, AI Orchestrator | Service-to-service API key. | `svc_ai_orchestrator_jwt` |
| `PENPOT_API_KEY` | Design Sync | API key for Penpot integration. | `penpot_api_key_xyz` |
| `MARKET_DATA_API_KEY` | Genesis Engine | Key for external market intelligence. | `market_api_key_123` |

### 3.2. Observability Endpoints

| Component | Endpoint | Port | Purpose |
| :--- | :--- | :--- | :--- |
| **Prometheus** | `http://prometheus:9090` | 9090 | Metrics collection. |
| **Grafana** | `http://grafana:3000` | 3000 | Dashboards (Aura Overview, AI Performance). |
| **Loki** | `http://loki:3100` | 3100 | Log aggregation. |
| **AI Orchestrator** | `http://ai-orchestrator:3001/metrics` | 3001 | Exposes service and agent-level metrics. |
| **Bull Board** | `http://ai-orchestrator:3001/admin/queues` | 3001 | Real-time queue monitoring. |

---

## 4. 🛡️ Security, Resilience, and Data Management

### 4.1. Security Enhancements

*   **Authentication**: All external API calls require JWT Bearer tokens. Internal service-to-service calls use a shared `X-API-Key` (from `infra/auth/api-keys.yaml`) for validation.
*   **Rate Limiting**: The `AuraJWTStrategy` includes a dynamic rate limiter based on user and brand context to prevent abuse and DDoS attacks.
*   **Malware Scanning**: The `asset-upload-hook.js` is configured to integrate with a dedicated ClamAV service (`clamav-scanner:3310`) to scan all incoming files before they are processed or stored.

### 4.2. Resilience (Circuit Breakers)

The system uses the Circuit Breaker pattern (`shared/resilience/circuit-breaker.js`) to isolate failures in critical external dependencies.

| Dependency | Breaker Name | Failure Threshold | Reset Timeout |
| :--- | :--- | :--- | :--- |
| AI Orchestrator | `aiOrchestrator` | 3 failures | 30 seconds |
| Brand Memory | `brandMemory` | 5 failures | 60 seconds |
| File Storage | `fileStorage` | 2 failures | 15 seconds |

### 4.3. Backup and Disaster Recovery (BDR)

The provided BDR scripts (`infra/backup/backup-script.sh`, `infra/backup/restore-script.sh`) ensure point-in-time recovery for all critical components:

1.  **PostgreSQL**: Dump and restore using `pg_dump`/`pg_restore`.
2.  **Redis**: RDB file backup.
3.  **File Storage**: Synchronization of the `/app/uploads` volume (or S3 bucket).
4.  **AI Models**: Tarball backup of the `/app/models` directory.

**RooCode Action**: Schedule `backup-script.sh` to run daily during off-peak hours (e.g., 02:00 AM UTC) via a Kubernetes CronJob.

---

## 5. 💡 Key Architectural Improvements for RooCode

The following structural improvements have been implemented to ensure the highest quality for production:

| Improvement | Rationale | Location |
| :--- | :--- | :--- |
| **Genesis Engine Isolation** | Separated the high-compute, stateful Brand Evolution logic into its own GPU-accelerated microservice. | `services/genesis-engine`, `infra/genesis-engine/docker-compose.genesis.yml` |
| **Knex Migrations** | Replaced raw SQL schema with versioned Knex migrations (`infra/database/migrations/001-initial-schema.js`) for reliable, idempotent database updates in CI/CD. | `infra/database/migrations/` |
| **Structured Logging** | Implemented `winston` and `LokiTransport` (`shared/monitoring/logger.js`) to ensure all logs are JSON-formatted and tagged with `service` and `environment` for easy querying. | `shared/monitoring/logger.js` |
| **SDK/Client Abstraction** | Created a dedicated `AuraClient` (`shared/sdk/aura-client.js`) with polling logic, caching, and robust error handling to standardize API consumption. | `shared/sdk/` |
| **Error Handling** | Centralized error classes (`AuraError`, `ValidationError`) and a global Express middleware to ensure consistent, secure, and traceable API error responses. | `shared/errors/error-handler.js` |

This package represents a complete, production-ready foundation for Aura BrandOS, ready for final deployment and implementation by RooCode. All architectural decisions prioritize scalability, resilience, and maintainability.

---

## References

1.  **Aura: The Sentient Brand Ecosystem - Architectural Review & Enhancement** (Source: `pasted_content.txt`)
2.  **Aura BrandOS - Codebase Foundation** (Source: `pasted_content_2.txt`)
3.  **Aura BrandOS - Production Handoff Audit** (Source: `pasted_content_3.txt`)
4.  **Aura Genesis: The Autonomous Brand Evolution Engine** (Source: `pasted_content_4.txt`)
