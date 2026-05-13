resource "google_cloud_scheduler_job" "daily_billing_bot" {
  name        = "daily-billing-bot"
  description = "Trigger billing bot daily"
  schedule    = "0 8 * * *"
  time_zone   = "Asia/Jakarta"
  region      = var.region

  http_target {
    http_method = "POST"
    uri         = google_cloudfunctions2_function.billing_bot.service_config[0].uri

    oidc_token {
      service_account_email = google_service_account.scheduler_sa.email
    }
  }

  depends_on = [google_project_service.apis]
}
