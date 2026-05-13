terraform {
  backend "gcs" {
    bucket = "kentandrian-dialogflow_terraform"
    prefix = "billing-notification-bot/state"
  }
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">= 7.32.0"
    }
  }
}

provider "google" {
  project = var.project_id
  region  = var.region
}
