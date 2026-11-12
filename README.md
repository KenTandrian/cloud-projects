# Ken's Cloud Projects

![Google Cloud](https://img.shields.io/badge/Google_Cloud-black?style=for-the-badge&logo=google-cloud)

## Introduction

A collection of demo projects showcasing Google Cloud services, including AI agents, Vertex AI, Google Kubernetes Engine (GKE), and networking.

> [!IMPORTANT]
> These demos are for illustration and learning, not for production use. This is not an officially supported Google product.
>
> Deploying a demo creates Google Cloud resources that may incur charges. Remember to clean up resources when you are done.

## Project Gallery

### AI & Machine Learning

#### [Antigravity Self-Hosted Model on Cloud Run GPU](./antigravity-self-hosted-model/)

- Self-hosted model on vLLM (NVIDIA L4) behind a LiteLLM gateway, used as an OpenAI-compatible model backend for Antigravity
- Tools: Cloud Run (GPU), Artifact Registry, Secret Manager, Cloud Build, Terraform
- Last updated: Nov 2026


#### [Content-Aware Image Cropper](./gemini-ai-image-cropper/)

- Web app that crops images around user-specified objects detected by Gemini
- Tools: Gemini on Vertex AI, Flask, Cloud Run
- Last updated: Apr 2026


#### [Vertex AI Search for Commerce Demo](./vais-retail/)

- Investment broker demo using Vertex AI Search features.
- Tools: Python, Next.js, Vertex AI Search for Commerce, Cloud Run
- Last updated: Jan 2026


#### [Android Agent with Gemini Computer Use](./gemini-computer-use-android/)

- AI agent that controls a virtual Android device through screenshots and ADB to complete tasks in mobile apps
- Tools: Gemini API (Computer Use), Compute Engine, Docker, Python
- Last updated: Dec 2025


#### [ADK Streaming Banking Agent](./adk-streaming/)

- Bidirectional voice and text banking assistant in Bahasa Indonesia with multi-agent routing
- Tools: Agent Development Kit (ADK), Gemini Live API, FastAPI
- Last updated: Oct 2025


#### [Gemini Enterprise Custom Domain](./gemini-enterprise-custom-domain/)

- Infrastructure for custom domain setup with Gemini Enterprise
- Tools: Cloud Load Balancing, Terraform
- Last updated: Oct 2025


#### [Travel Agent with MCP Toolbox for Databases and ADK](./travel-agent-mcp-toolbox-adk/)

- Hotel search agent that queries Cloud SQL for PostgreSQL through MCP Toolbox tools
- Tools: Agent Development Kit (ADK), MCP Toolbox for Databases, Cloud SQL, Cloud Run, Terraform
- Last updated: Sep 2025


#### [Cross-Project Service Account for Vertex AI Pipelines](./ai-pipelines-cross-project-sa/)

- Example of running Vertex AI Pipelines across projects
- Tools: Terraform, Python, Vertex AI
- Last updated: Aug 2025


#### [Notebooks](./notebooks/)

- Cloud Translation API with glossaries, and Veo 2 video generation
- Tools: Cloud Translation API, Veo on Vertex AI, Jupyter
- Last updated: May 2025

### Infrastructure & Networking

#### [Google Cloud Daily Billing Bot](./billing-notification-bot/)

- An automated bot that fetches Google Cloud billing spend and sends a daily breakdown to a Telegram chat. Deployed 100% via Terraform.
- Tools: Google Cloud BigQuery, Cloud Functions (2nd gen), Cloud Scheduler, Terraform, Telegram Bot API
- Last updated: Nov 2026


#### [GKE Gateway API with HTTPS](./gke-gateway-api-https/)

- Global external Gateway with Google-managed wildcard certificates and custom health checks
- Tools: GKE Gateway API, Certificate Manager, Cloud Load Balancing
- Last updated: Apr 2026


#### [Managed Cloud Service Mesh on GKE Autopilot](./gke-cloud-service-mesh/)

- Fully managed Cloud Service Mesh with strict mTLS and authorization policies, plus day-2 and day-3 operations guidance
- Tools: GKE Autopilot, Cloud Service Mesh, Fleet, Terraform
- Last updated: Apr 2026


#### [Kubernetes Service Account Authentication with Workload Identity](./gke-workload-identity/)

- A project to demonstrate how to authenticate GKE workloads to IAM using Kubernetes service account.
- Tools: Google Kubernetes Engine, Docker, Go
- Last updated: Apr 2025


#### [Hybrid Networking using Hub-and-spoke Topology](./hybrid-networking/)

- Connecting on-premise infrastructure to Google Cloud with hub-and-spoke topology implementation.
- Tools: Cloud DNS, Cloud NAT, Cloud VPC, Terraform
- Last updated: Jun 2024

##

Copyright &#169; 2024-2026 Ken Tandrian. All rights reserved.
