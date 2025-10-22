# Gutfit - Holistic Health Platform

> Empowering your journey to whole body health through the synergy of movement, nutrition, and spiritual well-being.

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Docker](https://img.shields.io/badge/Docker-Ready-blue.svg)](https://www.docker.com/)

## 🌟 Mission

At Gutfit, we harness the synergistic power of movement, nutrition, and spiritual well-being to cultivate lasting physical and mental resilience. We empower individuals with debilitating gut issues to find lasting relief without compromising their life or training.

## 🏗️ Architecture Overview

Gutfit is a comprehensive platform built on modern infrastructure:

### Core Services

- **PayloadCMS** - Content Management & Program Templates
- **Keycloak** - Authentication & Identity Management
- **Nextcloud (GutfitOS)** - Rebranded File System & Document Management
- **Moodle** - Learning Management & Course Delivery
- **AnythingLLM** - AI-Powered Operations Assistant

### Infrastructure Features

- 🐳 **Containerized Deployment** - Docker Compose orchestration
- 🤖 **AI-Driven Operations** - Agent-powered automation
- 🔐 **Multi-Tenant Architecture** - Isolated user environments
- 📱 **Client Applications** - Cross-platform mobile apps
- 🌐 **API Gateway** - Secure service communication

## 📁 Project Structure

```
gutfit-platform/
├── docs/                          # Documentation & Requirements
│   ├── requirements/              # Founder requirements & user stories
│   ├── infrastructure/            # Technical specifications
│   ├── analysis/                  # Business & market analysis
│   └── CLAUDE.md                  # AI conversation context
├── branding/                      # Brand assets & guidelines
│   ├── brand-docs/                # Brand strategy documents
│   ├── assets/                    # Logos, fonts, templates
│   └── site-images/               # Website imagery
├── code/                          # Source code & prototypes
│   ├── website/                   # Next.js/React frontends
│   └── prototypes/                # Experimental features
├── assets/                        # Media assets
│   ├── photos/                    # User content & photos
│   ├── icons/                     # Icon library
│   └── logos/                     # Logo variations
├── .vscode/                       # Development environment config
└── .clinerules/                   # AI assistance rules
```

## 🚀 Quick Start

### Prerequisites

- Docker & Docker Compose
- Node.js 18+ & pnpm
- Ansible (for advanced deployments)

### Local Development

1. **Clone the repository**

   ```bash
   git clone https://github.com/iniitydev/gutfit-platform.git
   cd gutfit-platform
   ```

2. **Setup development environment**

   ```bash
   # Install dependencies
   pnpm install

   # Start MCP servers (optional)
   pnpm add -g @21st-dev/magic @upstash/context7-mcp
   ```

3. **Infrastructure deployment**
   ```bash
   # From docs/infrastructure/
   docker-compose up -d
   ```

### Key Components

#### 🏠 The Gutfit Method

Our flagship 6-month transformation program featuring:

- Personalized coaching sessions
- Evidence-based nutrition protocols
- Form-focused movement programs
- Mindfulness & breathwork integration

#### 🧠 AI Operations (GutfitOps)

- Intelligent service provisioning
- Automated user onboarding
- Dynamic content personalization
- Health metrics analysis

## 👥 Founders

### Dijana Spajic - Founder & Lead Trainer

Fitness trainer and evidence-based nutritionist specializing in gut biome optimization, immune system strengthening, and holistic wellness. "Food is thy medicine - let me help you tap into your best self."

### Dr. Guillermo Wilches - Founder & Psychotherapist

Clinical psychologist and health scientist with expertise in holistic behavioral change psychology. Overcame severe health challenges through Gutfit's protocol to reclaim strength and vitality.

## 📋 The Three Pillars

### 🏃 **Movement**

Precision over duration - efficient workouts that build strength, boost endorphins, and deliver grounded energy for busy lifestyles.

### 🧘 **Mindset & Spirituality**

Cultivate inner peace through accessible breathwork and mindfulness practices that reduce stress and build deep-rooted mental resilience.

### 🥗 **Nutrition**

Evidence-based protocols with nutrient-rich recipes that support gut health, brain function, and immune system vitality.

## 🤝 Contributing

We welcome contributions from the community! Please see our contributing guidelines in `docs/contributing.md`.

### Development Setup

1. Fork the repository
2. Create a feature branch: `git checkout -b feature/amazing-feature`
3. Make your changes and test thoroughly
4. Submit a pull request

## 📄 License

This project is licensed under the MIT License - see the [LICENSE](LICENSE) file for details.

## 📞 Contact

- Website: [gutfit.co](https://gutfit.co)
- Email: info@gutfit.ca
- LinkedIn: [@Gutfit](https://linkedin.com/company/gutfit)

---

_"True, sustainable health requires addressing all dimensions of wellness: physical, emotional, and mental. When these work together, true healing and vitality emerge."_

— Gutfit Ethos
