resource "google_dns_managed_zone" "spoke-local-zone" {
  name        = "spoke-local-zone"
  project     = var.spoke_project_id
  dns_name    = "spoke.cloud.local."
  description = "Private DNS zone for resources in spoke network"
  visibility  = "private"

  private_visibility_config {
    networks {
      network_url = google_compute_network.spoke-network.id
    }
  }
}

resource "google_dns_managed_zone" "hub-peering-zone" {
  name        = "hub-peering-zone"
  project     = var.spoke_project_id
  dns_name    = "local."
  description = "Private DNS peering zone to hub network"
  visibility  = "private"

  private_visibility_config {
    networks {
      network_url = google_compute_network.spoke-network.id
    }
  }

  peering_config {
    target_network {
      network_url = google_compute_network.hub-network.id
    }
  }
}
