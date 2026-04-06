variable "project_id" {
  description = "The ID of the Google Cloud project"
  type        = string
  default     = "my-project-id"
}

variable "location" {
  description = "The location of the Google Cloud project"
  type        = string
  default     = "asia-southeast1"
}

variable "cluster_name" {
  type        = string
  description = "The name of your existing GKE Autopilot cluster"
  default     = "cluster-1"
}

variable "cluster_location" {
  description = "The location where your GKE Autopilot cluster is deployed (e.g., us-central1)"
  type        = string
  default     = "asia-southeast1"
}
