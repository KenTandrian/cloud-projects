resource "google_compute_router_nat" "hub-nat" {
  name                               = "hub-nat"
  router                             = google_compute_router.hub-router1.name
  project                            = google_compute_router.hub-router1.project
  region                             = google_compute_router.hub-router1.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ALL"
  }
}

resource "google_compute_router_nat" "onprem-nat" {
  name                               = "onprem-nat"
  router                             = google_compute_router.onprem-router1.name
  project                            = google_compute_router.onprem-router1.project
  region                             = google_compute_router.onprem-router1.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ALL"
  }
}

resource "google_compute_router" "spoke-router1" {
  name    = "spoke-router1"
  project = var.spoke_project_id
  region  = var.region
  network = google_compute_network.spoke-network.id
}

resource "google_compute_router_nat" "spoke-nat" {
  name                               = "spoke-nat"
  router                             = google_compute_router.spoke-router1.name
  project                            = google_compute_router.spoke-router1.project
  region                             = google_compute_router.spoke-router1.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "ALL_SUBNETWORKS_ALL_IP_RANGES"

  log_config {
    enable = true
    filter = "ALL"
  }
}
