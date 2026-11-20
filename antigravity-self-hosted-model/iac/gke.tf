# Optional GKE Inference Gateway backend (enable_gke = true).
# Terraform creates the Google Cloud resources. The Kubernetes resources in k8s/
# are applied afterwards with kubectl and helm.
module "gke" {
  source = "./modules/gke-inference-gateway"
  count  = var.enable_gke ? 1 : 0

  project_id                   = var.project_id
  region                       = var.region
  network_id                   = google_compute_network.agy.id
  artifact_registry_repository = google_artifact_registry_repository.images.name

  depends_on = [google_project_service.apis]
}
