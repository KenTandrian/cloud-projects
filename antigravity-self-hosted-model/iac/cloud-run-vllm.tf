# vLLM on 1x NVIDIA L4. Weights are downloaded from Hugging Face on every cold start.
resource "google_cloud_run_v2_service" "vllm" {
  provider             = google-beta
  name                 = "vllm-coder-backend"
  location             = var.region
  ingress              = "INGRESS_TRAFFIC_INTERNAL_ONLY" # only reachable from the VPC (LiteLLM); rejected before an instance starts
  invoker_iam_disabled = true                            # LiteLLM authenticates with VLLM_API_KEY, not a Google ID token
  deletion_protection  = false

  template {
    service_account                  = google_service_account.vllm.email
    timeout                          = "3600s"
    max_instance_request_concurrency = 8
    gpu_zonal_redundancy_disabled    = true

    scaling {
      min_instance_count = 0
      max_instance_count = 1 # caps cost at one L4
    }

    node_selector {
      accelerator = "nvidia-l4"
    }

    containers {
      image = local.vllm_image
      args = [
        var.model_id, # positional; `--model` is deprecated in `vllm serve`
        "--host=0.0.0.0",
        "--port=8000",
        "--quantization=awq_marlin",
        # Qwen3 supports 40960 natively; 32768 leaves KV-cache headroom on a 24 GB L4.
        "--max-model-len=32768",
        "--gpu-memory-utilization=0.90",
        "--max-num-seqs=8",
        "--enable-auto-tool-choice",
        "--tool-call-parser=hermes", # Qwen3 emits <tool_call>...</tool_call>
        "--reasoning-parser=qwen3",  # splits any <think> output into reasoning_content
        # Thinking off by default: faster, and Antigravity's openai protocol has no thinking UI.
        "--default-chat-template-kwargs={\"enable_thinking\": false}",
      ]

      ports {
        container_port = 8000
      }

      env {
        name = "VLLM_API_KEY" # vLLM enforces this on /v1/* when set
        value_source {
          secret_key_ref {
            secret  = google_secret_manager_secret.vllm_api_key.secret_id
            version = "latest"
          }
        }
      }

      resources {
        limits = {
          cpu              = "8"
          memory           = "32Gi" # weights are downloaded into in-memory disk (~9.5 GB)
          "nvidia.com/gpu" = "1"
        }
        cpu_idle          = false
        startup_cpu_boost = true
      }

      startup_probe {
        http_get {
          path = "/health" # unauthenticated in vLLM
          port = 8000
        }
        period_seconds    = 10
        timeout_seconds   = 5
        failure_threshold = 90 # up to 15 min: HF download speed varies (cold starts seen at 6-10 min)
      }
    }
  }

  depends_on = [
    terraform_data.mirror_images,
    google_secret_manager_secret_iam_member.vllm_reads_vllm_key,
    google_secret_manager_secret_version.vllm_api_key,
  ]
}
