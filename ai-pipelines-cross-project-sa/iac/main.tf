# ===================================================================
# PREREQUISITE: MANUAL ORGANIZATION POLICY CHANGE
# ===================================================================
# This configuration will only work if the following Organization Policy
# is set correctly. This is a high-level security setting that must
# typically be changed by a Google Cloud Organization Administrator.
#
# 1. Navigate to "IAM & Admin" -> "Organization Policies".
# 2. Find the policy "Disable cross-project service account usage".
#    (Constraint: constraints/iam.disableCrossProjectServiceAccountUsage)
# 3. Ensure this policy is NOT ENFORCED on the service account's
#    project ('service_account_project_id').
# ===================================================================


# ===================================================================
# VARIABLES
# ===================================================================

variable "gcs_bucket_name" {
  type        = string
  description = "The name of the GCS bucket for the pipeline root."
}

variable "local_user_principal" {
  type        = string
  description = "The user principal submitting the job, found via 'gcloud auth application-default print-access-token' (e.g., user:name@example.com)."
}

variable "service_account_project_id" {
  type        = string
  description = "The project where the custom Service Account lives."
}

variable "vertex_project_id" {
  type        = string
  description = "The project where the Vertex AI workload runs."
}


# ===================================================================
# DATA SOURCES & RESOURCES
# ===================================================================

# Look up the project details for the Vertex AI project to get its number.
data "google_project" "vertex_project_info" {
  provider   = google.vertex_project
  project_id = var.vertex_project_id
}

# Look up the existing GCS bucket for the pipeline root.
data "google_storage_bucket" "pipeline_bucket" {
  provider = google.vertex_project
  name     = var.gcs_bucket_name
}

# Create the custom service account in the source project.
resource "google_service_account" "cross_project_sa" {
  project      = var.service_account_project_id
  account_id   = "tf-test-vertex-runner"
  display_name = "Terraform Test Vertex Runner"
}


# ===================================================================
# PERMISSIONS
# ===================================================================

# STEP 1: Grant the Vertex AI Service Agent "Service Account Token Creator"
# This is the SERVER-SIDE permission. It allows the Vertex AI service in the
# destination project to impersonate the custom SA from the source project.
resource "google_service_account_iam_member" "vertex_agent_token_creator" {
  service_account_id = google_service_account.cross_project_sa.name
  role               = "roles/iam.serviceAccountTokenCreator"

  member = "serviceAccount:service-${data.google_project.vertex_project_info.number}@gcp-sa-aiplatform.iam.gserviceaccount.com"
}

# STEP 2: Grant the User "Service Account User"
# This is the CLIENT-SIDE permission. It allows you, the submitter, to
# "attach" the custom SA to the pipeline job request.
resource "google_service_account_iam_member" "user_service_account_user" {
  service_account_id = google_service_account.cross_project_sa.name
  role               = "roles/iam.serviceAccountUser"
  member             = var.local_user_principal
}


# ===================================================================
# Additional Supporting Permissions
# ===================================================================

# Allow the custom Service Account to run jobs in the Vertex AI project.
resource "google_project_iam_member" "sa_vertex_user_binding" {
  provider = google.vertex_project
  project  = var.vertex_project_id
  role     = "roles/aiplatform.viewer"
  member   = google_service_account.cross_project_sa.member
}

# Allow the custom Service Account to write artifacts to the GCS bucket.
resource "google_storage_bucket_iam_member" "sa_storage_binding" {
  provider = google.vertex_project
  bucket   = data.google_storage_bucket.pipeline_bucket.name
  role     = "roles/storage.objectAdmin"
  member   = google_service_account.cross_project_sa.member
}

# Allow your local user to create jobs in the Vertex AI project.
resource "google_project_iam_member" "adc_vertex_user_binding" {
  provider = google.vertex_project
  project  = var.vertex_project_id
  role     = "roles/aiplatform.user"
  member   = var.local_user_principal
}

# Allow your local user to perform pre-flight checks against Google Cloud APIs.
resource "google_project_iam_member" "adc_service_usage_binding" {
  provider = google.vertex_project
  project  = data.google_storage_bucket.pipeline_bucket.project
  role     = "roles/serviceusage.serviceUsageConsumer"
  member   = var.local_user_principal
}


# ===================================================================
# OUTPUTS
# ===================================================================

output "service_account_email" {
  value       = google_service_account.cross_project_sa.email
  description = "The email of the newly created service account."
}

output "gcs_pipeline_root_path" {
  value       = "gs://${data.google_storage_bucket.pipeline_bucket.name}/pipeline-roots"
  description = "The full GCS path to use for the PIPELINE_ROOT in your Python script."
}
