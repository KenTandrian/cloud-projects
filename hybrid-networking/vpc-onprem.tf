resource "google_compute_network" "onprem-network" {
    project = var.onprem_project_id
    name = "onprem-network"
}

resource "google_compute_subnetwork" "onprem-subnet" {
    name = "onprem-subnet"
    project = var.onprem_project_id
    region = var.region
    network = google_compute_network.onprem-network.name
    ip_cidr_range = "10.10.0.0/24"
}

resource "google_compute_firewall" "onprem-network-allow-ssh-icmp" {
    name    = "onprem-network-allow-ssh-icmp"
    project = var.onprem_project_id
    network = google_compute_network.onprem-network.name
    direction = "INGRESS"
    source_ranges = [ "0.0.0.0/0" ]
    allow {
        protocol = "icmp"
    }
    allow {
        protocol = "tcp"
        ports    = ["22"]
    }
}
