# Vertex AI Pipelines with Cross-Project Service Account

This repository provides a complete, working example of how to run a Vertex AI Pipeline in a destination Google Cloud project while using a Service Account from a different source project. It uses Terraform to define all the necessary IAM permissions and resources in a repeatable, infrastructure-as-code manner.

This solution addresses a common enterprise scenario where a centralized project manages service accounts and identity, while workloads are executed in separate, environment-specific projects.

## Core Concepts Demonstrated

This project successfully navigates three distinct layers of Google Cloud security that are required for cross-project service account usage:

1.  **Organization Policy (`iam.disableCrossProjectServiceAccountUsage`):** The master switch. This top-level policy must be configured to allow service accounts to be attached to resources in other projects.
2.  **Server-Side Execution Permission (`roles/iam.serviceAccountTokenCreator`):** The permission required by the Vertex AI Service Agent in the destination project to impersonate the custom service account from the source project _after_ the job has been submitted.
3.  **Client-Side Submission Permission (`roles/iam.serviceAccountUser`):** The permission required by the user or script _submitting_ the job to "attach" the cross-project service account to the pipeline request.

## Prerequisites

Before you begin, ensure you have the following tools installed and configured:

- **Google Cloud SDK (`gcloud`):** [Installation Guide](https://cloud.google.com/sdk/docs/install)
- **Terraform:** [Installation Guide](https://learn.hashicorp.com/tutorials/terraform/install-cli)
- **Python 3.11+**
- **Permissions:** You must have sufficient permissions to run `terraform apply` and grant IAM roles in the relevant projects. You may need assistance from a Google Cloud Organization Administrator for the first step.

---

## Step-by-Step Setup and Execution

### Step 1: (One-Time) Configure the Organization Policy

This high-level security step typically needs to be done once by an Organization Administrator.

1.  In the Google Cloud Console, navigate to **IAM & Admin > Organization Policies**.
2.  Find the policy named **"Disable cross-project service account usage"** (Constraint: `constraints/iam.disableCrossProjectServiceAccountUsage`).
3.  Ensure this policy is **not enforced** on the project where the service account will be created (the "source" project).

### Step 2: Configure and Apply the Infrastructure (`iac` folder)

1.  Navigate to the infrastructure directory:

    ```bash
    cd iac
    ```

2.  **Find your User Principal:** The script needs to grant permissions to the identity you use for local development. Find this by running the following command and copying the email address:

    ```bash
    ACCESS_TOKEN=$(gcloud auth application-default print-access-token)
    curl -s "https://www.googleapis.com/oauth2/v3/tokeninfo?access_token=$ACCESS_TOKEN" | grep email\"
    ```

3.  **Create the `.tfvars` file:** Create a file named `terraform.tfvars` and add your user principal to it, prefixed with `user:`.

    ```terraform
    # terraform.tfvars
    # Replace with the principal from the command above
    local_user_principal = "user:your-name@example.com"
    ```

4.  **Apply the Terraform Configuration:**

    ```bash
    # Initialize Terraform
    terraform init

    # Apply the configuration
    terraform apply
    ```

    Terraform will create the service account and print the outputs (like `service_account_email` and `gcs_pipeline_root_path`). **Keep these values handy for the next section.**

### Step 3: Configure and Run the Pipeline (`pipeline` folder)

All Python and pipeline commands should be run from within the `pipeline` directory.

1.  Navigate to the pipeline directory from the project root:

    ```bash
    cd ../pipeline
    ```

2.  **Set Up the Python Environment:** Install the required Python libraries.

    ```bash
    pip install -r requirements.txt
    ```

3.  **Compile the Pipeline:** This project uses a simple "Hello World" pipeline. Compile it into the `.json` format that Vertex AI can execute.

    ```bash
    python3 compile_pipeline.py
    ```

    This will create a `pipeline.json` file in the `pipeline` directory.

4.  **Configure the Execution Environment:** In the `pipeline` directory, create a `.env` file to store the configuration. Copy the output values from the `terraform apply` command you ran in the `iac` directory.

    ```sh
    # .env file
    # Fill these values in from your Terraform outputs

    export VERTEX_PROJECT_ID="your-vertex-project-id"
    export PIPELINE_ROOT="gs://your-gcs-bucket/pipeline-roots"
    export SERVICE_ACCOUNT_EMAIL="tf-test-vertex-runner@your-sa-project-id.iam.gserviceaccount.com"
    export VERTEX_LOCATION="us-central1"
    ```

5.  **Run the Pipeline:**

    ```bash
    # Load the environment variables from the .env file
    source .env

    # Execute the submission script
    python3 submit_pipeline.py
    ```

    The script will submit the pipeline job to Vertex AI. You can follow the link printed in the console to view its execution.

---

## Resource Cleanup

To remove all resources and permissions created by this example, run the following command:

```bash
terraform destroy
```

---

## Project Structure

```
.
├── iac/
│   ├── main.tf              # Main Terraform file defining all resources and permissions.
│   ├── providers.tf         # Terraform provider configuration.
│   └── terraform.tfvars     # (You create this) Your local user principal variable.
│
├── pipeline/
│   ├── compile_pipeline.py  # Python script to compile the Hello World pipeline to JSON.
│   ├── pipeline.json        # The compiled pipeline definition, ready for execution.
│   ├── requirements.txt     # Required Python libraries for this project.
│   ├── submit_pipeline.py   # Python script to submit the pipeline job to Vertex AI.
│   └── .env                 # (You create this) Project-specific configuration.
│
└── README.md
```
