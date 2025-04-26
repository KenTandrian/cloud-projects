variable "project_id" {
  description = "The ID of the Google Cloud project"
  type        = string
  default     = "my-project-id"
}

variable "cluster_name" {
  description = "The name of the GKE cluster"
  type        = string
  default     = "standard-gke-1"
}

variable "location" {
  description = "The location (region) of the GKE cluster and other resources"
  type        = string
  default     = "asia-southeast2"
}

variable "bucket_name" {
  description = "The name of the GCS bucket"
  type        = string
  default     = "sample-gcs-bucket"
}

variable "namespace" {
  description = "The Kubernetes namespace to use"
  type        = string
  default     = "ns-1"
}

variable "service_account_name" {
  description = "The name of the Kubernetes service account"
  type        = string
  default     = "sa-1"
}

variable "repository_name" {
  description = "The name of the Artifact Registry repository"
  type        = string
  default     = "my-repo"
}
