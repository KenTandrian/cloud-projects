variable "project_id" {
  type = string
}

variable "region" {
  type = string
}

variable "network_id" {
  type        = string
  description = "VPC shared with the Cloud Run LiteLLM egress subnet."
}

variable "artifact_registry_repository" {
  type        = string
  description = "Name of the Artifact Registry repo that holds the mirrored vLLM image."
}

variable "cluster_name" {
  type    = string
  default = "agy-igw"
}

variable "nodes_cidr" {
  type    = string
  default = "10.20.0.0/22"
}

variable "pods_cidr" {
  type    = string
  default = "10.32.0.0/16"
}

variable "services_cidr" {
  type    = string
  default = "10.40.0.0/20"
}

variable "proxy_only_cidr" {
  type        = string
  description = "Proxy-only subnet for gke-l7-rilb. /23 recommended, /26 minimum."
  default     = "10.30.0.0/23"
}
