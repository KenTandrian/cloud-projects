import google.auth
from google.cloud import retail_v2
from google.cloud import storage
import os

# --- PLEASE UPDATE THESE VARIABLES ---
# Your Google Cloud project ID (will be auto-detected if not set)
PROJECT_ID = google.auth.default()[1]
# The name of the GCS bucket you created.
BUCKET_NAME = "your-unique-bucket-name" 
# The local file you want to upload and import.
LOCAL_FILE_PATH = "user_events.json"
# -----------------------------------

def upload_to_gcs(bucket_name: str, source_file_path: str, destination_blob_name: str):
    """Uploads a file to the specified GCS bucket."""
    if not os.path.exists(source_file_path):
        print(f"Error: Local file not found at '{source_file_path}'")
        return False
        
    print(f"Uploading '{source_file_path}' to 'gs://{bucket_name}/{destination_blob_name}'...")
    
    try:
        storage_client = storage.Client(project=PROJECT_ID)
        bucket = storage_client.bucket(bucket_name)
        blob = bucket.blob(destination_blob_name)

        blob.upload_from_filename(source_file_path)

        print("File uploaded successfully.")
        return True
    except Exception as e:
        print(f"An error occurred during GCS upload: {e}")
        return False

def import_user_events(project_id: str, bucket_name: str, gcs_file_name: str):
    """Starts a user event import job in Vertex AI Search for retail."""
    print("Starting user event import from GCS...")
    
    try:
        # Create a client
        client = retail_v2.UserEventServiceClient()

        # The parent catalog resource name
        parent = f"projects/{project_id}/locations/global/catalogs/default_catalog"

        # GCS path for the input file
        gcs_input_uri = f"gs://{bucket_name}/{gcs_file_name}"
        
        # GCS path for the error log file (optional but recommended)
        gcs_errors_uri = f"gs://{bucket_name}/import_errors"

        # Configure the input source
        gcs_source = retail_v2.GcsSource(input_uris=[gcs_input_uri])
        input_config = retail_v2.UserEventInputConfig(gcs_source=gcs_source)

        # Configure the errors destination
        errors_config = retail_v2.ImportErrorsConfig(gcs_prefix=gcs_errors_uri)

        # Create the request
        request = retail_v2.ImportUserEventsRequest(
            parent=parent,
            input_config=input_config,
            errors_config=errors_config,
        )

        # Make the API call to start the long-running operation
        operation = client.import_user_events(request=request)

        print("\n--- Import Operation Initiated ---")
        print(f"Operation name: {operation.operation.name}")
        print("This is a long-running operation. It can take 20-30 minutes or more to complete.")
        print("You can monitor its status in the Google Cloud Console under 'Vertex AI Search for retail' > 'Data' > 'Activity'.")
        return operation

    except Exception as e:
        print(f"An error occurred during the import request: {e}")
        return None

def main():
    """Main function to run the upload and import process."""
    if BUCKET_NAME == "your-unique-bucket-name":
        print("ERROR: Please update the BUCKET_NAME variable in the script before running.")
        return

    # The name of the file in the GCS bucket will be the same as the local file name
    gcs_blob_name = os.path.basename(LOCAL_FILE_PATH)
    
    # Step 1: Upload the file
    script_dir = os.path.dirname(__file__)
    resources_path = os.path.join(script_dir, LOCAL_FILE_PATH)
    upload_successful = upload_to_gcs(
        bucket_name=BUCKET_NAME,
        source_file_path=resources_path,
        destination_blob_name=gcs_blob_name
    )
    
    # Step 2: If upload was successful, start the import
    if upload_successful:
        import_user_events(
            project_id=PROJECT_ID,
            bucket_name=BUCKET_NAME,
            gcs_file_name=gcs_blob_name
        )
    else:
        print("\nImport step skipped due to upload failure.")

if __name__ == "__main__":
    main()
