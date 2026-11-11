# Private path from LiteLLM to vLLM.
# vLLM accepts only internal traffic. LiteLLM sends all its egress through this subnet
# (Direct VPC egress), and Private Google Access lets that traffic reach vLLM's run.app URL.
resource "google_compute_network" "agy" {
  name                    = "agy-self-hosted"
  auto_create_subnetworks = false
  depends_on              = [google_project_service.apis]
}

resource "google_compute_subnetwork" "litellm_egress" {
  name                     = "agy-litellm-egress"
  region                   = var.region
  network                  = google_compute_network.agy.id
  ip_cidr_range            = "10.10.0.0/26" # /26 is the minimum Cloud Run recommends for Direct VPC egress
  private_ip_google_access = true
}
