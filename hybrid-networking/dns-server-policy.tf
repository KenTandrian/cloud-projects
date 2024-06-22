resource "google_dns_policy" "forward-to-bind9" {
  name           = "forward-to-bind9"
  description    = "Forward DNS queries to BIND server"
  project        = var.onprem_project_id
  enable_logging = true

  alternative_name_server_config {
    target_name_servers {
      # The internal IP address of the BIND server VM.
      ipv4_address    = "10.10.0.3"
      forwarding_path = "private"
    }
  }

  networks {
    network_url = google_compute_network.onprem-network.id
  }
}

resource "google_dns_policy" "hub-inbound-policy" {
  name                      = "hub-inbound-policy"
  description               = "DNS inbound policy from onprem-network to hub-network"
  project                   = var.hub_project_id
  enable_inbound_forwarding = true
  enable_logging            = true

  networks {
    network_url = google_compute_network.hub-network.id
  }
}
