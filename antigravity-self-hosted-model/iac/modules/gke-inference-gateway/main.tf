# Google Cloud side of the GKE Inference Gateway backend.
# The Kubernetes side (vLLM, InferencePool + Endpoint Picker, Gateway, HTTPRoute)
# lives in ../../../k8s/ and is applied with kubectl and helm after this.

# ---------- Network ----------
# Nodes, pods, and services. Private Google Access lets nodes pull from
# Artifact Registry without going through NAT.
resource "google_compute_subnetwork" "nodes" {
  name                     = "agy-gke-nodes"
  region                   = var.region
  network                  = var.network_id
  ip_cidr_range            = var.nodes_cidr
  private_ip_google_access = true

  secondary_ip_range {
    range_name    = "agy-pods"
    ip_cidr_range = var.pods_cidr
  }
  secondary_ip_range {
    range_name    = "agy-services"
    ip_cidr_range = var.services_cidr
  }
}

# Required by the regional internal Application Load Balancer (gke-l7-rilb)
# that GKE creates for the Inference Gateway.
resource "google_compute_subnetwork" "proxy_only" {
  name          = "agy-gke-proxy"
  region        = var.region
  network       = var.network_id
  ip_cidr_range = var.proxy_only_cidr
  purpose       = "REGIONAL_MANAGED_PROXY"
  role          = "ACTIVE"
}

# Internet egress for the GKE subnet only (Hugging Face weights, registry.k8s.io).
# The LiteLLM egress subnet is not listed, so LiteLLM still has no internet access.
resource "google_compute_router" "gke" {
  name    = "agy-gke-router"
  region  = var.region
  network = var.network_id
}

resource "google_compute_router_nat" "gke" {
  name                               = "agy-gke-nat"
  router                             = google_compute_router.gke.name
  region                             = var.region
  nat_ip_allocate_option             = "AUTO_ONLY"
  source_subnetwork_ip_ranges_to_nat = "LIST_OF_SUBNETWORKS"

  subnetwork {
    name                    = google_compute_subnetwork.nodes.id
    source_ip_ranges_to_nat = ["ALL_IP_RANGES"] # nodes and pods
  }
}

# Fixed private IP for the Inference Gateway, so LiteLLM's VLLM_API_BASE is known
# before the Kubernetes Gateway exists. Referenced from k8s/ as a NamedAddress.
resource "google_compute_address" "inference_gateway" {
  name         = "agy-igw-ip"
  region       = var.region
  subnetwork   = google_compute_subnetwork.nodes.id
  address_type = "INTERNAL"
  purpose      = "SHARED_LOADBALANCER_VIP"
}

# ---------- Node identity ----------
resource "google_service_account" "nodes" {
  account_id   = "agy-gke-node-sa"
  display_name = "Antigravity GKE nodes"
}

resource "google_project_iam_member" "nodes_default" {
  project = var.project_id
  role    = "roles/container.defaultNodeServiceAccount"
  member  = "serviceAccount:${google_service_account.nodes.email}"
}

# Pull the vLLM image that Cloud Build already mirrors into this repo.
resource "google_artifact_registry_repository_iam_member" "nodes_reader" {
  location   = var.region
  repository = var.artifact_registry_repository
  role       = "roles/artifactregistry.reader"
  member     = "serviceAccount:${google_service_account.nodes.email}"
}

# ---------- Cluster ----------
# Autopilot: no GPU node pool to manage. An L4 node is created when the vLLM pod
# asks for one, and removed when the Deployment is scaled to 0.
resource "google_container_cluster" "this" {
  name                = var.cluster_name
  location            = var.region
  enable_autopilot    = true
  network             = var.network_id
  subnetwork          = google_compute_subnetwork.nodes.id
  deletion_protection = false

  release_channel {
    channel = "RAPID" # InferencePool CRD is built in from 1.34.0-gke.1626000
  }

  ip_allocation_policy {
    cluster_secondary_range_name  = "agy-pods"
    services_secondary_range_name = "agy-services"
  }

  # Nodes have no external IPs (egress goes through the NAT above).
  # The control plane keeps its public endpoint so kubectl works from a laptop.
  private_cluster_config {
    enable_private_nodes    = true
    enable_private_endpoint = false
  }

  gateway_api_config {
    channel = "CHANNEL_STANDARD"
  }

  cluster_autoscaling {
    auto_provisioning_defaults {
      service_account = google_service_account.nodes.email
      oauth_scopes    = ["https://www.googleapis.com/auth/cloud-platform"]
    }
  }

  depends_on = [
    google_project_iam_member.nodes_default,
    google_artifact_registry_repository_iam_member.nodes_reader,
    google_compute_subnetwork.proxy_only,
    google_compute_router_nat.gke,
  ]
}
