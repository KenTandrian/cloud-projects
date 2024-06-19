resource "google_compute_network" "spoke-network" {
    name = "spoke-network"
    project = var.spoke_project_id
}

resource "google_compute_subnetwork" "spoke-subnet" {
    name = "spoke-subnet"
    project = var.spoke_project_id
    region = var.region
    network = google_compute_network.spoke-network.name
    ip_cidr_range = "10.12.0.0/24"
}

resource "google_compute_firewall" "spoke-network-allow-ssh-icmp" {
    name    = "spoke-network-allow-ssh-icmp"
    project = var.spoke_project_id
    network = google_compute_network.spoke-network.name
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
