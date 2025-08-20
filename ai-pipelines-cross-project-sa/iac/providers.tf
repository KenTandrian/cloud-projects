terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 6.49.0"
    }
  }
}

provider "google" {
  project = var.service_account_project_id
}

provider "google" {
  alias   = "vertex_project"
  project = var.vertex_project_id
}
