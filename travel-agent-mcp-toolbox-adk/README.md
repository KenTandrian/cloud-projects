# Build a Travel Agent using MCP Toolbox for Databases and Agent Development Kit (ADK)

This project implements a travel agent application using the MCP (Model Context Protocol) Toolbox and Google ADK (Agent Development Kit). The application allows users to query for hotel information by name or location.

This project is based on the Google Codelab: [Build a Travel Agent using MCP Toolbox for Databases and Agent Development Kit (ADK)](https://codelabs.developers.google.com/travel-agent-mcp-toolbox-adk).

## Project Structure

The project is organized into the following directories:

- **`iac/`**: Contains the Infrastructure as Code (IaC) files for provisioning the necessary Google Cloud resources using Terraform.
- **`mcp-toolbox/`**: Contains the configuration for the MCP Toolbox, which defines the tools and data sources used by the agent.
- **`my-agents/`**: Contains the agent application code, including the main agent logic and deployment configurations.

## How it Works

The application uses a Gemini-powered agent to understand user queries and interact with a PostgreSQL database containing hotel information. The MCP Toolbox provides the connection between the agent and the database, allowing the agent to use predefined SQL queries as "tools" to retrieve data.

### Infrastructure

The infrastructure is defined in the `iac/` directory using Terraform. It provisions the following resources:

- **Google Cloud SQL for PostgreSQL**: A managed PostgreSQL database to store hotel data.
- **Google Cloud Service Account**: A service account with permissions to access the database and other necessary services.

### MCP Toolbox

The `mcp-toolbox/` directory contains the `tools.yaml` file, which defines the data sources and tools available to the agent. In this project, the following tools are defined:

- **`search-hotels-by-name`**: Searches for hotels by name.
- **`search-hotels-by-location`**: Searches for hotels by location.

### Agent Application

The agent application is located in the `my-agents/hotel-agent-app/` directory. The `agent.py` file contains the main logic for the agent, including its name, model, description, and the tools it can use. The `Makefile` in the `my-agents/` directory provides commands for deploying and running the agent.

## Getting Started

To get started with this project, follow the instructions in the [Google Codelab](https://codelabs.developers.google.com/travel-agent-mcp-toolbox-adk). The codelab provides a step-by-step guide to setting up the project, provisioning the infrastructure, and deploying the agent.

### Prerequisites

- A Google Cloud project with billing enabled.
- The Google Cloud SDK installed and configured.
- Terraform installed.

### Deployment

1.  **Provision the infrastructure**:

    - Navigate to the `iac/` directory.
    - Initialize Terraform: `terraform init`
    - Apply the Terraform configuration: `terraform apply`

2.  **Install the MCP Toolbox**:

    - Navigate to the `mcp-toolbox/` directory.
    - Run the installation script: `./install-toolbox.sh`

3.  **Deploy the agent**:
    - Navigate to the `my-agents/` directory.
    - Update the `Makefile` with your Google Cloud project ID.
    - Deploy the agent to Cloud Run: `make deploy`
