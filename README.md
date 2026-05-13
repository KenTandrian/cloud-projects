# Ken's Cloud Projects

![Google Cloud](https://img.shields.io/badge/Google_Cloud-black?style=for-the-badge&logo=google-cloud)

## Introduction

A collection of demo projects showcasing various Google Cloud Platform services and features.

## Project Gallery

### AI & Machine Learning

#### [Vertex AI Search for Commerce Demo](./vais-retail/)

- Investment broker demo using Vertex AI Search features.
- Tools: Python, Next.js, Vertex AI Search for Commerce, Cloud Run

#### [Cross-Project Service Account for Vertex AI Pipelines](./ai-pipelines-cross-project-sa/)

- Example of running Vertex AI Pipelines across projects
- Tools: Terraform, Python, Vertex AI

#### [Gemini Enterprise Custom Domain](./gemini-enterprise-custom-domain/)

- Infrastructure for custom domain setup with Gemini Enterprise
- Tools: Cloud Load Balancing, Terraform

### Infrastructure & Networking

#### [Google Cloud Daily Billing Bot](./google-cloud-daily-billing-bot/)

- An automated bot that fetches Google Cloud billing spend and sends a daily breakdown to a Telegram chat. Deployed 100% via Terraform.
- Tools: Google Cloud BigQuery, Cloud Functions (2nd gen), Cloud Scheduler, Terraform, Telegram Bot API

#### [Kubernetes Service Account Authentication with Workload Identity](./gke-workload-identity/)

- A project to demonstrate how to authenticate GKE workloads to IAM using Kubernetes service account.
- Tools: Google Kubernetes Engine, Docker, Go

#### [Hybrid Networking using Hub-and-spoke Topology](./hybrid-networking/)

- Connecting on-premise infrastructure to Google Cloud with hub-and-spoke topology implementation.
- Tools: Cloud DNS, Cloud NAT, Cloud VPC, Terraform

### Web Applications

#### [Conway's Game of Life Series](./game-of-life/)

- Vanilla JS Implementation with WebGPU ([Codelab](https://codelabs.developers.google.com/your-first-webgpu-app))
- TypeScript/Vite Implementation: GPU-accelerated grid simulation using compute shaders and typed pipelines
- Rust/WebAssembly Implementation: Memory-efficient implementation using FixedBitSet with native-speed processing
- Tools: WebGPU, TypeScript, Rust, WebAssembly, Docker, Cloud Run

#### [News GRPC API](./news-grpc/)

- A gRPC API project for articles data management.
- Tools: gRPC, TypeScript, Protobuf

##

Copyright &#169; 2024-2025 Ken Tandrian. All rights reserved.
