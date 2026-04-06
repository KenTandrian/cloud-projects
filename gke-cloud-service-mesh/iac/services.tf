resource "google_project_service" "mesh" {
  project            = var.project_id
  service            = "mesh.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "traffic_director" {
  project            = var.project_id
  service            = "trafficdirector.googleapis.com"
  disable_on_destroy = false
}

resource "google_project_service" "meshca" {
  project            = var.project_id
  service            = "meshca.googleapis.com"
  disable_on_destroy = false
}
