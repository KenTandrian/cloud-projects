resource "google_dns_managed_zone" "cloud-local-zone" {
  name        = "cloud-local-zone"
  project     = var.hub_project_id
  dns_name    = "cloud.local."
  description = "Private DNS zone for resources in hub network"
  visibility  = "private"

  private_visibility_config {
    networks {
      network_url = google_compute_network.hub-network.id
    }
  }
}

resource "google_dns_managed_zone" "spoke-peering-zone" {
  name        = "spoke-peering-zone"
  project     = var.hub_project_id
  dns_name    = "spoke.cloud.local."
  description = "Private DNS peering zone to spoke network"
  visibility  = "private"

  private_visibility_config {
    networks {
      network_url = google_compute_network.hub-network.id
    }
  }

  peering_config {
    target_network {
      network_url = google_compute_network.spoke-network.id
    }
  }
}

resource "google_dns_managed_zone" "onprem-forwarding-zone" {
  name        = "onprem-forwarding-zone"
  project     = var.hub_project_id
  dns_name    = "site.local."
  description = "Private DNS zone to forward to on-premise DNS server"
  visibility  = "private"

  private_visibility_config {
    networks {
      network_url = google_compute_network.hub-network.id
    }
  }

  forwarding_config {
    target_name_servers {
      ipv4_address = var.onprem_dns_server_ip
    }
  }
}
