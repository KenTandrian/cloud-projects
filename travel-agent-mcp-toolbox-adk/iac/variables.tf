variable "gcp_project_id" {
  description = "The GCP project ID."
  type        = string
}

variable "gcp_region" {
  description = "The GCP region."
  type        = string
  default     = "us-central1"
}

variable "db_password" {
  description = "The root password for the database."
  type        = string
  sensitive   = true
  default     = "postgres"
}
