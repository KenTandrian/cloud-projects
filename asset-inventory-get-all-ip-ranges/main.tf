variable "organization_id" {
  type = string
}

data "google_cloud_asset_search_all_resources" "subnets" {
  provider = google-beta
  scope = "organizations/${var.organization_id}"
  asset_types = ["compute.googleapis.com/Subnetwork"]
}

data "google_compute_subnetwork" "subnet" {
  for_each = {
    for k,v in data.google_cloud_asset_search_all_resources.subnets.results: k => {
      name    = basename(v.name),
      project = basename(v.parent_full_resource_name),
      region  = v.location
    }
  }
  name     = each.value.name
  project  = each.value.project
  region   = each.value.region
}

output "subnets" {
  value = [
    for s in data.google_compute_subnetwork.subnet : s.ip_cidr_range
  ]
}
