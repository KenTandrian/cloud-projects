terraform {
  backend "gcs" {
    bucket = "your-bucket-name"
    prefix = "agentspace-custom-domain/state"
  }
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 7.2.0"
    }
  }
}

provider "google" {
  project = var.project_id
}
