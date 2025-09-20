terraform {
  backend "gcs" {
    bucket = "your-bucket-name"
    prefix = "travel-agent-mcp-toolbox-adk/state"
  }
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 7.3.0"
    }
  }
}

provider "google" {
  project = var.gcp_project_id
  region  = var.gcp_region
}
