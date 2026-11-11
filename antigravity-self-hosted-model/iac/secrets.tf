# Keys are generated here and therefore stored in Terraform state in plain text.
# Keep state local and never commit it (see .gitignore).
resource "random_password" "litellm_master" {
  length  = 64
  special = false
}

resource "random_password" "vllm_api" {
  length  = 64
  special = false
}

resource "google_secret_manager_secret" "litellm_master_key" {
  secret_id = "agy-litellm-master-key"
  replication {
    user_managed {
      replicas { location = var.region }
    }
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "litellm_master_key" {
  secret      = google_secret_manager_secret.litellm_master_key.id
  secret_data = "sk-${random_password.litellm_master.result}"
}

resource "google_secret_manager_secret" "vllm_api_key" {
  secret_id = "agy-vllm-api-key"
  replication {
    user_managed {
      replicas { location = var.region }
    }
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "vllm_api_key" {
  secret      = google_secret_manager_secret.vllm_api_key.id
  secret_data = random_password.vllm_api.result
}

resource "google_secret_manager_secret" "litellm_config" {
  secret_id = "agy-litellm-config"
  replication {
    user_managed {
      replicas { location = var.region }
    }
  }
  depends_on = [google_project_service.apis]
}

resource "google_secret_manager_secret_version" "litellm_config" {
  secret      = google_secret_manager_secret.litellm_config.id
  secret_data = templatefile(local.litellm_config, { model_id = var.model_id })
}
