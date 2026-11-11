output "gateway_url" {
  value = google_cloud_run_v2_service.litellm.uri
}

output "vllm_url" {
  value = google_cloud_run_v2_service.vllm.uri
}

output "litellm_master_key" {
  value     = "sk-${random_password.litellm_master.result}"
  sensitive = true
}

output "vllm_api_key" {
  value     = random_password.vllm_api.result
  sensitive = true
}
