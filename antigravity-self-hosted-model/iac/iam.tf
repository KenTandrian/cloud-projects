# ---------- Cloud Build (image mirror) ----------
resource "google_service_account" "build" {
  account_id   = "agy-build-sa"
  display_name = "Antigravity self-hosted Cloud Build mirror"
  depends_on   = [google_project_service.apis]
}

resource "google_artifact_registry_repository_iam_member" "build_writer" {
  location   = google_artifact_registry_repository.images.location
  repository = google_artifact_registry_repository.images.name
  role       = "roles/artifactregistry.writer"
  member     = "serviceAccount:${google_service_account.build.email}"
}

resource "google_project_iam_member" "build_logs" {
  project = var.project_id
  role    = "roles/logging.logWriter"
  member  = "serviceAccount:${google_service_account.build.email}"
}

# ---------- Runtime identities (one per service) ----------
resource "google_service_account" "vllm" {
  account_id   = "agy-vllm-sa"
  display_name = "Antigravity self-hosted vLLM runtime"
  depends_on   = [google_project_service.apis]
}

resource "google_service_account" "litellm" {
  account_id   = "agy-litellm-sa"
  display_name = "Antigravity self-hosted LiteLLM runtime"
  depends_on   = [google_project_service.apis]
}

# ---------- Secret access (resource-scoped) ----------
resource "google_secret_manager_secret_iam_member" "vllm_reads_vllm_key" {
  secret_id = google_secret_manager_secret.vllm_api_key.id
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.vllm.email}"
}

resource "google_secret_manager_secret_iam_member" "litellm_reads" {
  for_each = {
    master = google_secret_manager_secret.litellm_master_key.id
    vllm   = google_secret_manager_secret.vllm_api_key.id
    config = google_secret_manager_secret.litellm_config.id
  }
  secret_id = each.value
  role      = "roles/secretmanager.secretAccessor"
  member    = "serviceAccount:${google_service_account.litellm.email}"
}
