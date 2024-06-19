resource "google_compute_network_peering" "hub-to-spoke" {
  name         = "hub-to-spoke"
  network      = google_compute_network.hub-network.self_link
  peer_network = google_compute_network.spoke-network.self_link

  export_custom_routes = true
}

resource "google_compute_network_peering" "spoke-to-hub" {
  name         = "spoke-to-hub"
  network      = google_compute_network.spoke-network.self_link
  peer_network = google_compute_network.hub-network.self_link

  import_custom_routes = true
}
