# 1. Runtime SA for the Cloud Function
resource "google_service_account" "function_sa" {
  account_id   = "billing-bot-func-sa"
  display_name = "Billing Bot Function Runtime"
}

resource "google_project_iam_member" "bq_data" {
  project = var.project_id
  role    = "roles/bigquery.dataViewer"
  member  = "serviceAccount:${google_service_account.function_sa.email}"
}

resource "google_project_iam_member" "bq_user" {
  project = var.project_id
  role    = "roles/bigquery.jobUser"
  member  = "serviceAccount:${google_service_account.function_sa.email}"
}

# 2. Invoker SA for the Cloud Scheduler
resource "google_service_account" "scheduler_sa" {
  account_id   = "billing-bot-sched-sa"
  display_name = "Billing Bot Scheduler Trigger"
}

resource "google_project_iam_member" "scheduler_invoker" {
  project = var.project_id
  role    = "roles/run.invoker"
  member  = "serviceAccount:${google_service_account.scheduler_sa.email}"
}
