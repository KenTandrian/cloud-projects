terraform {
  required_providers {
    google = {
      source  = "hashicorp/google"
      version = ">=6.32.0"
    }
  }
}

data "google_project" "project" {
    project_id = var.project_id
}

resource "google_container_cluster" "primary" {
  name     = var.cluster_name
  location = var.location
  deletion_protection = false

  # Enable Workload Identity
  workload_identity_config {
    workload_pool = "${var.project_id}.svc.id.goog"
  }

  # Basic node pool configuration
  initial_node_count = 1
  node_config {
    # Enable GKE metadata server
    metadata = {
      disable-legacy-endpoints = "true"
    }
  }
}

# Create a GCS bucket
resource "google_storage_bucket" "default" {
  name          = var.bucket_name
  location      = var.location
  force_destroy = false
  uniform_bucket_level_access = true
}

# Grant Storage Legacy Bucket Reader role to the Kubernetes service account
resource "google_storage_bucket_iam_member" "bucket_reader" {
  bucket = google_storage_bucket.default.name
  role   = "roles/storage.legacyBucketReader"
  member = "principal://iam.googleapis.com/projects/${data.google_project.project.number}/locations/global/workloadIdentityPools/${var.project_id}.svc.id.goog/subject/ns/${var.namespace}/sa/${var.service_account_name}"
}

# Create an Artifact Registry repository
resource "google_artifact_registry_repository" "default" {
  location      = var.location
  repository_id = var.repository_name
  description   = "Docker repository"
  format        = "DOCKER"
}

# Output the GKE cluster name and endpoint
output "cluster_endpoint" {
  value = google_container_cluster.primary.endpoint
}

output "artifact_registry_repo_name" {
  value = google_artifact_registry_repository.default.name
}
