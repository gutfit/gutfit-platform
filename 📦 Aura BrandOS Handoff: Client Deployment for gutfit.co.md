# 📦 Aura BrandOS Handoff: Client Deployment for gutfit.co

**Author**: Manus AI
**Project**: Aura: The Sentient Brand Ecosystem
**Target Deployment**: Production
**Target Directus URL**: `https://direct.gutfit.co`

---

## 🎯 Executive Summary for gutfit.co Deployment

This document outlines the specific configuration required to deploy the production-ready Aura BrandOS stack for **gutfit.co**. The architecture leverages the full microservices stack, including the AI Orchestrator and the Genesis Engine, ensuring maximum brand compliance and evolutionary capabilities.

The primary customization involves setting the environment variables and network configurations to correctly point all services and external access to the `gutfit.co` domain.

## 1. ⚙️ Environment Variable Customization

The following variables must be set in the Kubernetes Secret for the `gutfit.co` deployment. These override the generic placeholders in the master deployment guide.

| Variable | Service(s) | Value for `gutfit.co` | Rationale |
| :--- | :--- | :--- | :--- |
| `NODE_ENV` | All | `production` | Ensures production-level logging and performance settings. |
| `DIRECTUS_URL` | All (external) | `https://direct.gutfit.co` | Primary external URL for the Directus Core API. |
| `CORS_ORIGINS` | Directus, AI Orchestrator | `https://direct.gutfit.co, https://app.gutfit.co` | Allows cross-origin requests from the client's front-end application. |
| `BRAND_ID` | Directus (Seeder) | `<gutfit_brand_uuid>` | The UUID for the primary gutfit.co brand, used for initial data seeding and rule loading. |
| `PENPOT_URL` | Design Sync | `https://penpot.gutfit.co` | Assuming a dedicated or proxied Penpot instance for the client. |
| `MARKET_DATA_API_KEY` | Genesis Engine | `<gutfit_market_key>` | Specific API key used for gutfit.co's target market analysis. |

## 2. 🌐 Network and Ingress Configuration

The Kubernetes Ingress resource must be configured to route traffic for `direct.gutfit.co` to the Directus Core service (port 8055).

**Required Ingress Configuration:**

| Setting | Value |
| :--- | :--- |
| **Host** | `direct.gutfit.co` |
| **Path** | `/` |
| **Service** | `aura-directus-service` |
| **Port** | `8055` |
| **TLS/SSL** | Enabled, using certificate for `direct.gutfit.co` |

## 3. 💾 Data Seeding and Initial Setup

The database seeding script (`infra/database/seeds/production-seed.js`) should be modified to create the initial `gutfit.co` brand entity and associated brand rules.

**Key Seeding Steps:**

1.  **Brand Creation**: Insert the `gutfit.co` brand with the specified UUID.
2.  **Initial Rules**: Load the foundational brand rules (e.g., color palette, typography) specific to gutfit.co.
3.  **Admin User**: Create the initial administrative user account for the gutfit.co team.

## 4. 🚀 Final Deployment Checklist for gutfit.co

This checklist is specific to the client's environment and must be verified before final handoff.

| Checkpoint | Status | Notes |
| :--- | :--- | :--- |
| **DNS A Record** | [ ] Completed | `direct.gutfit.co` points to the Ingress Load Balancer IP. |
| **SSL Certificate** | [ ] Completed | Valid TLS certificate installed for `direct.gutfit.co`. |
| **Secrets Applied** | [ ] Completed | All custom environment variables from Section 1 are loaded into Kubernetes Secrets. |
| **Ingress Verified** | [ ] Completed | Accessing `https://direct.gutfit.co` successfully loads the Directus API. |
| **AI GPU Allocation** | [ ] Completed | AI Orchestrator and Genesis Engine pods are scheduled on GPU-enabled nodes. |
| **BDR Schedule** | [ ] Completed | Daily backup CronJob is scheduled and verified. |
| **Observability** | [ ] Completed | Grafana dashboards are receiving metrics from all services (Directus, AI, Genesis). |

---

This customized package ensures that the deployment is perfectly aligned with the `gutfit.co` domain and operational requirements.
