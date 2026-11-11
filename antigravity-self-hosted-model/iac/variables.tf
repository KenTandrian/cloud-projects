variable "project_id" {
  type        = string
  description = "GCP project ID. Set in terraform.tfvars (gitignored)."
}

variable "region" {
  type    = string
  default = "asia-southeast1"
}

variable "vllm_tag" {
  type        = string
  description = "Pinned vllm/vllm-openai tag (no floating tags). Must support --tool-call-parser=hermes and AWQ-Marlin."
}

variable "litellm_tag" {
  type        = string
  description = "Pinned ghcr.io/berriai/litellm tag, 1.83.7 or newer."
}

variable "model_id" {
  type    = string
  default = "Qwen/Qwen3-14B-AWQ"
}

locals {
  repo          = "${var.region}-docker.pkg.dev/${var.project_id}/${google_artifact_registry_repository.images.repository_id}"
  vllm_image    = "${local.repo}/vllm-openai:${var.vllm_tag}"
  litellm_image = "${local.repo}/litellm:${var.litellm_tag}"

  # Non-Terraform config files live in sibling folders of iac/.
  mirror_config  = abspath("${path.module}/../cloudbuild/mirror.yaml")
  litellm_config = abspath("${path.module}/../litellm/config.yaml.tftpl")
}
