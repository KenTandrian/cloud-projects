locals {
  services = [
    "gkehub.googleapis.com", # Fleet API
    "mesh.googleapis.com"    # Cloud Service Mesh API
  ]
}

resource "google_project_service" "apis" {
  for_each           = toset(local.services)
  project            = var.project_id
  service            = each.value
  disable_on_destroy = false
}

# Fetch the existing GKE Autopilot cluster data
data "google_container_cluster" "gke_cluster" {
  name     = var.cluster_name
  location = var.cluster_location
  project  = var.project_id
}

# Register the existing GKE cluster to the Fleet
resource "google_gke_hub_membership" "fleet_membership" {
  project       = var.project_id
  membership_id = var.cluster_name

  endpoint {
    gke_cluster {
      # This securely links your cluster to the Fleet
      resource_link = "//container.googleapis.com/${data.google_container_cluster.gke_cluster.id}"
    }
  }

  depends_on = [google_project_service.apis]
}

# Enable the Cloud Service Mesh feature globally on the Fleet
resource "google_gke_hub_feature" "servicemesh" {
  project  = var.project_id
  name     = "servicemesh"
  location = "global"

  depends_on = [google_project_service.apis]
}

# Enable "Automatic Management" (Managed CSM) for your specific cluster
resource "google_gke_hub_feature_membership" "servicemesh_membership" {
  project    = var.project_id
  location   = "global"
  feature    = google_gke_hub_feature.servicemesh.name
  membership = google_gke_hub_membership.fleet_membership.membership_id

  mesh {
    # This tells Google to manage the Control Plane and Data Plane
    # bypassing the need for you to install open-source Istio
    management = "MANAGEMENT_AUTOMATIC"
  }
}
