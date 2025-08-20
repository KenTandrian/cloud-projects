import os
from google.cloud import aiplatform

PIPELINE_ROOT = os.environ.get("PIPELINE_ROOT")
SERVICE_ACCOUNT_EMAIL = os.environ.get("SERVICE_ACCOUNT_EMAIL")
VERTEX_PROJECT_ID = os.environ.get("VERTEX_PROJECT_ID")
VERTEX_LOCATION = os.environ.get("VERTEX_LOCATION")

aiplatform.init(project=VERTEX_PROJECT_ID, location=VERTEX_LOCATION)

job = aiplatform.PipelineJob(
    display_name="ai-pipeline-cross-project-test",
    template_path="pipeline.json", 
    pipeline_root=PIPELINE_ROOT,
)

print(f"Submitting pipeline job using service account: {SERVICE_ACCOUNT_EMAIL}")

job.run(
    service_account=SERVICE_ACCOUNT_EMAIL,
    sync=True, # Set to True to wait for the job to start
)

print("Pipeline job submitted successfully!")
print(f"View the job here: {job._dashboard_uri()}")
