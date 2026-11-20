output "cluster_name" {
  value = google_container_cluster.this.name
}

output "inference_gateway_address_name" {
  description = "Use as the Gateway's NamedAddress in k8s/."
  value       = google_compute_address.inference_gateway.name
}

output "inference_gateway_ip" {
  value = google_compute_address.inference_gateway.address
}

output "vllm_api_base" {
  description = "Base URL LiteLLM uses when vllm_backend = \"gke\"."
  value       = "http://${google_compute_address.inference_gateway.address}/v1"
}
