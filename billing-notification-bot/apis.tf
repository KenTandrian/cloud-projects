# Enable necessary Google Cloud APIs
resource "google_project_service" "apis" {
  for_each = toset([
    "cloudfunctions.googleapis.com",
    "cloudbuild.googleapis.com",
    "run.googleapis.com",
    "cloudscheduler.googleapis.com",
  ])
  service            = each.key
  disable_on_destroy = false
}
