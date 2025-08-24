import google.auth
from google.cloud.retail import CreateModelRequest, Model, ModelServiceClient

# --- Configuration ---
project_id = google.auth.default()[1]
default_catalog = f"projects/{project_id}/locations/global/catalogs/default_catalog"

# Define the model details
MODEL_DISPLAY_NAME = "recommended_for_you_1"
MODEL_TYPE = "recommended-for-you"
OPTIMIZATION_OBJECTIVE = "ctr" 
# -------------------

def create_retail_model():
    """Creates the 'Recommended for You' recommendation model."""
    model_config = Model(
        name=f"{default_catalog}/models/{MODEL_DISPLAY_NAME}",
        display_name="Recommended For You 1",
        type_=MODEL_TYPE,
        optimization_objective=OPTIMIZATION_OBJECTIVE
    )
    create_model_request = CreateModelRequest(
        parent = default_catalog,
        model=model_config
    )

    print(f"--- Creating Model: '{MODEL_DISPLAY_NAME}' ---")
    print(create_model_request)

    model_client = ModelServiceClient()
    operation = model_client.create_model(create_model_request)

    print("\n--- Model Creation Operation Initiated ---")
    print(f"Operation Name: {operation.operation.name}")
    print("Training will take several hours. Monitor status in the Google Cloud Console.")

create_retail_model()
