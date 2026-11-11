# LiteLLM gateway (CPU only). This is the endpoint Antigravity connects to.
resource "google_cloud_run_v2_service" "litellm" {
  provider             = google-beta
  name                 = "agy-litellm-gateway"
  location             = var.region
  ingress              = "INGRESS_TRAFFIC_ALL"
  invoker_iam_disabled = true # required: Antigravity sends its own Bearer key, not a Google ID token
  deletion_protection  = false

  template {
    service_account                  = google_service_account.litellm.email
    timeout                          = "3600s"
    max_instance_request_concurrency = 40

    scaling {
      min_instance_count = 0
      max_instance_count = 1
    }

    # Direct VPC egress: all outbound traffic goes through the VPC, so calls to vLLM's
    # run.app URL count as internal. There is no NAT, so LiteLLM has no internet access.
    vpc_access {
      network_interfaces {
        network    = google_compute_network.agy.id
        subnetwork = google_compute_subnetwork.litellm_egress.id
      }
      egress = "ALL_TRAFFIC"
    }

    volumes {
      name = "litellm-config"
      secret {
        secret = google_secret_manager_secret.litellm_config.secret_id
        items {
          version = "latest"
          path    = "config.yaml"
        }
      }
    }

    containers {
      image = local.litellm_image
      args  = ["--config", "/etc/litellm/config.yaml", "--host", "0.0.0.0", "--port", "4000"]

      ports {
        container_port = 4000
      }

      env {
        name  = "VLLM_API_BASE"
        value = "${google_cloud_run_v2_service.vllm.uri}/v1"
      }
      env {
        # LiteLLM reads its config only at startup; a new hash forces a new revision.
        name  = "LITELLM_CONFIG_SHA"
        value = sha256(google_secret_manager_secret_version.litellm_config.secret_data)
      }
      env {
        name  = "NO_DOCS"
        value = "True"
      }
      env {
        name  = "DISABLE_ADMIN_UI"
        value = "True"
      }
      env {
        # Use the bundled model price list instead of downloading it (no internet egress).
        name  = "LITELLM_LOCAL_MODEL_COST_MAP"
        value = "True"
      }
      env {
        name = "LITELLM_MASTER_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.litellm_master_key.secret_id
            version = "latest"
          }
        }
      }
      env {
        name = "VLLM_API_KEY"
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.vllm_api_key.secret_id
            version = "latest"
          }
        }
      }

      volume_mounts {
        name       = "litellm-config"
        mount_path = "/etc/litellm"
      }

      resources {
        limits = {
          cpu    = "1"
          memory = "2Gi"
        }
      }

      startup_probe {
        http_get {
          path = "/health/liveliness" # /health needs auth and calls the model
          port = 4000
        }
        period_seconds    = 5
        timeout_seconds   = 5
        failure_threshold = 24
      }
    }
  }

  depends_on = [
    terraform_data.mirror_images,
    google_secret_manager_secret_iam_member.litellm_reads,
    google_secret_manager_secret_version.litellm_master_key,
    google_secret_manager_secret_version.vllm_api_key,
    google_secret_manager_secret_version.litellm_config,
  ]
}
