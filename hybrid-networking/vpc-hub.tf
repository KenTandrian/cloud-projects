resource "google_compute_network" "hub-network" {
    name = "hub-network"
    project = var.hub_project_id
}

resource "google_compute_subnetwork" "hub-subnet" {
    name = "hub-subnet"
    project = var.hub_project_id
    region = var.region
    network = google_compute_network.hub-network.name
    ip_cidr_range = "10.11.0.0/24"
}

resource "google_compute_firewall" "hub-network-allow-ssh-icmp" {
    name    = "hub-network-allow-ssh-icmp"
    project = var.hub_project_id
    network = google_compute_network.hub-network.name
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
