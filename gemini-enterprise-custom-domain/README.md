# Gemini Enterprise Custom Domain

This directory contains Terraform code to provision the necessary Google Cloud infrastructure to front the Gemini Enterprise (formerly known as Google Agentspace) applications with a custom domain. It sets up a global external HTTPS load balancer that acts as a reverse proxy to the Google-managed backend service.

## Codelab Reference

This code is based on the codelab: [Agentspace Custom Domain](https://codelabs.developers.google.com/agentspace-networking-customdomain)

## Architecture

The Terraform configuration will create the following resources:

- **VPC Network**: Uses the `default` VPC network in your project.
- **Global IP Address**: A static external IP address for the load balancer.
- **Global Internet Network Endpoint Group (NEG)**: A backend NEG of type `INTERNET_FQDN_PORT` that points to the Google-managed service (`vertexaisearch.cloud.google.com`).
- **HTTPS Load Balancer**: A global external HTTPS load balancer configured with:
  - A **Backend Service** that routes traffic to the Internet NEG.
  - A **URL Map** that performs a URL rewrite. It maps the user-friendly path `/travel` to the specific backend path required by the Gemini Enterprise application, using the `app_travel_id` variable.
  - A **Google-managed SSL Certificate** for the custom domain to enable HTTPS.
  - A **Target Proxy** and **Forwarding Rule** to connect the external IP address to the URL map.
- **Cloud DNS Zone & Record**: The Terraform code assumes you have a managed DNS zone for your domain. You will need to manually create an `A` record pointing `gemini-enterprise.your-domain.com` to the load balancer's external IP address.

## Usage

1.  **Configure Backend:**
    Open the `providers.tf` file and replace `"your-bucket-name"` with the name of your GCS bucket for storing the Terraform state.

2.  **Initialize Terraform:**
    Ensure you have Terraform installed and authenticated with Google Cloud.

    ```bash
    terraform init
    ```

3.  **Create a `terraform.tfvars` file:**
    Create a file named `terraform.tfvars` and add the following content, replacing the placeholder values:

    ```hcl
    project_id    = "your-gcp-project-id"
    domain_name   = "your-custom-domain.com"
    app_travel_id = "your-gemini-enterprise-travel-app-id"
    ```

4.  **Apply the Terraform configuration:**
    Review the plan and approve the execution.
    ```bash
    terraform apply
    ```

## Redirect Behavior

It is expected that the Gemini Enterprise custom domain will perform a `302` redirect to the Google-managed URL (`vertexaisearch.cloud.google.com`).

This is the intended behavior as described in the codelab. The load balancer correctly performs a server-side URL rewrite, but the backend service itself then issues a client-side redirect.
