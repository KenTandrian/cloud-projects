data "archive_file" "function_zip" {
  type        = "zip"
  source_dir  = "${path.module}/src"
  output_path = "${path.module}/function.zip"
  excludes    = [".env"]
}

data "google_project" "project" {
  project_id = var.project_id
}

resource "google_storage_bucket" "code_bucket" {
  name                        = "gcf-v2-sources-${data.google_project.project.number}-${var.region}"
  location                    = var.region
  uniform_bucket_level_access = true
}

resource "google_storage_bucket_object" "function_zip" {
  name   = "function-${data.archive_file.function_zip.output_md5}.zip"
  bucket = google_storage_bucket.code_bucket.name
  source = data.archive_file.function_zip.output_path
}

resource "google_cloudfunctions2_function" "billing_bot" {
  name        = "gcp-billing-bot"
  location    = var.region
  description = "Sends daily Google Cloud billing to a messenger"

  build_config {
    runtime     = "python314"
    entry_point = "run"
    source {
      storage_source {
        bucket = google_storage_bucket.code_bucket.name
        object = google_storage_bucket_object.function_zip.name
      }
    }
  }

  service_config {
    max_instance_count    = 1
    available_memory      = "256M"
    timeout_seconds       = 60
    service_account_email = google_service_account.function_sa.email

    environment_variables = {
      TELEGRAM_BOT_TOKEN = var.telegram_bot_token
      TELEGRAM_CHAT_ID   = var.telegram_chat_id
      BQ_TABLE_NAME      = var.bq_table_name
    }
  }

  depends_on = [google_project_service.apis]
}
