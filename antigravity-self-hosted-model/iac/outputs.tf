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

output "gke_cluster_name" {
  value = one(module.gke[*].cluster_name)
}

output "inference_gateway_address_name" {
  description = "NamedAddress for the Gateway in k8s/."
  value       = one(module.gke[*].inference_gateway_address_name)
}

output "inference_gateway_ip" {
  value = one(module.gke[*].inference_gateway_ip)
}
