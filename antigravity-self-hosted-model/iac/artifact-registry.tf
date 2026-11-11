# Standard (not remote) Docker repo. Cloud Run rejects image layers > 9.9 GB when
# pulling from Docker Hub or a remote repo, and the vLLM CUDA layers are large,
# so the images are copied here instead.
resource "google_artifact_registry_repository" "images" {
  location      = var.region
  repository_id = "agy-self-hosted"
  format        = "DOCKER"
  description   = "Antigravity self-hosted model: mirrored vLLM and LiteLLM images"
  depends_on    = [google_project_service.apis]
}

# Copies the pinned upstream images into the repo with Cloud Build.
# Re-runs only when a tag (or the repo) changes. Requires the gcloud CLI locally.
resource "terraform_data" "mirror_images" {
  triggers_replace = {
    repo        = local.repo
    vllm_tag    = var.vllm_tag
    litellm_tag = var.litellm_tag
    config      = filesha256(local.mirror_config)
  }

  provisioner "local-exec" {
    command = <<-EOT
      gcloud builds submit --no-source \
        --config="${local.mirror_config}" \
        --region="${var.region}" \
        --service-account="${google_service_account.build.id}" \
        --substitutions="_REPO=${local.repo},_VLLM_TAG=${var.vllm_tag},_LITELLM_TAG=${var.litellm_tag}" \
        --project="${var.project_id}"
    EOT
  }

  depends_on = [
    google_artifact_registry_repository_iam_member.build_writer,
    google_project_iam_member.build_logs,
  ]
}
