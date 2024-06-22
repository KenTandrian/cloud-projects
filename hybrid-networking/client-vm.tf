resource "google_compute_instance" "hub-vm" {
  name         = "hub-vm"
  project      = var.hub_project_id
  machine_type = "e2-medium"
  zone         = "${REGION}-a"

  tags = ["client-vm"]

  boot_disk {}
  network_interface {
    network = google_compute_network.hub-network.self_link
    subnetwork = google_compute_subnetwork.hub-subnet.self_link
  }

  metadata = {
    enable-oslogin = "TRUE"
  }
}

resource "google_compute_instance" "spoke-vm" {
  name         = "spoke-vm"
  project      = var.spoke_project_id
  machine_type = "e2-medium"
  zone         = "${REGION}-a"

  tags = ["client-vm"]

  boot_disk {}
  network_interface {
    network = google_compute_network.spoke-network.self_link
    subnetwork = google_compute_subnetwork.spoke-subnet.self_link
  }

  metadata = {
    enable-oslogin = "TRUE"
  }
}

resource "google_compute_instance" "onprem-vm" {
  name         = "onprem-vm"
  project      = var.onprem_project_id
  machine_type = "e2-medium"
  zone         = "${REGION}-a"

  tags = ["client-vm"]

  boot_disk {}
  network_interface {
    network = google_compute_network.onprem-network.self_link
    subnetwork = google_compute_subnetwork.onprem-subnet.self_link
  }

  metadata = {
    enable-oslogin = "TRUE"
  }
}
