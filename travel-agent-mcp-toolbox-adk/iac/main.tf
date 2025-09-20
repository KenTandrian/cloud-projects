resource "google_sql_database_instance" "hoteldb_instance" {
  name             = "hoteldb-instance"
  database_version = "POSTGRES_15"
  region           = var.gcp_region

  settings {
    tier    = "db-g1-small"
    edition = "ENTERPRISE"
  }

  root_password = var.db_password
}

resource "google_service_account" "toolbox_identity" {
  account_id   = "mcp-toolbox"
  display_name = "MCP Toolbox Identity"
}

resource "google_project_iam_member" "secret_accessor" {
  project = var.gcp_project_id
  role    = "roles/secretmanager.secretAccessor"
  member  = "serviceAccount:${google_service_account.toolbox_identity.email}"
}

resource "google_project_iam_member" "cloudsql_client" {
  project = var.gcp_project_id
  role    = "roles/cloudsql.client"
  member  = "serviceAccount:${google_service_account.toolbox_identity.email}"
}
