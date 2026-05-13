# ☁️ Google Cloud Daily Billing Bot

An automated, serverless bot that fetches your current Google Cloud billing spend and sends a daily breakdown to a Telegram chat. Deployed 100% via Terraform (Infrastructure as Code).

## 🚀 Features
* **Daily Notifications**: Automatically runs every day at 08:00 AM (Jakarta time).
* **Smart Data Fetching**: Bypasses the standard 48-hour Google Cloud billing delay by dynamically querying the latest `usage_end_time`.
* **Cost Breakdown**: Shows the grand total and the top 5 most expensive services.
* **Highly Secure**: Implements the Principle of Least Privilege with separate, dedicated Service Accounts for the Cloud Function and Cloud Scheduler.
* **Serverless**: Uses Cloud Functions Gen 2 and Cloud Scheduler, costing close to $0.00 to run.

---

## 🏗 Architecture & Tech Stack
* **Google Cloud BigQuery**: Stores the exported Google Cloud billing data.
* **Cloud Functions (Gen 2) / Python 3.10**: Queries BigQuery and sends the HTTP request to Telegram.
* **Cloud Scheduler**: Triggers the Cloud Function daily via secure OIDC tokens.
* **Terraform**: Manages and deploys all infrastructure, IAM roles, and source code.
* **Telegram Bot API**: Delivers the messages to a personal chat or group.

---

## 📂 Project Structure

```text
billing-bot/
├── providers.tf       # Provider configuration & versions
├── variables.tf       # Variable definitions & types
├── outputs.tf         # Values to output after deployment
├── main.tf            # Core project configurations (APIs)
├── iam.tf             # Service accounts and IAM bindings
├── function.tf        # Cloud storage, code packaging, and Cloud Function
├── scheduler.tf       # Cloud Scheduler cron job
├── terraform.tfvars   # ⚠️ Secret values (DO NOT COMMIT)
├── README.md          # Project documentation
└── src/
    ├── main.py        # Python bot logic
    └── requirements.txt # Python dependencies
```

---

## 📋 Prerequisites

1. **Google Cloud CLI (`gcloud`)** installed and authenticated:
   ```bash
   gcloud auth application-default login
   ```
2. **Terraform** installed.
3. **Billing Export to BigQuery** enabled. You need the fully qualified table name (e.g., `your-project-id.billing_dataset.gcp_billing_export_resource_v1_XXXXXX`).
4. **Telegram Bot Token & Chat ID**:
   * Message `@BotFather` on Telegram to create a bot and get an HTTP API Token.
   * Send a message to your bot, then visit `https://api.telegram.org/bot<YOUR_TOKEN>/getUpdates` to find your `chat_id`.

---

## 🛠️ Setup & Deployment

### 1. Configure Secrets
Create a file named `terraform.tfvars` in the root directory. **Do not commit this file to version control.** Add your specific details:

```hcl
project_id         = "your-gcp-project-id"
bq_table_name      = "your-gcp-project-id.billing_dataset.gcp_billing_export_resource_v1_XXXX"
telegram_bot_token = "123456789:ABCdefGHIjklmNoPQRstUVwxyZ"
telegram_chat_id   = "123456789" # Use your personal ID or Group ID
```

### 2. Deploy the Infrastructure
Initialize Terraform to download required plugins:
```bash
terraform init
```

Review the infrastructure plan:
```bash
terraform plan
```

Deploy the resources to Google Cloud:
```bash
terraform apply
```
*(Type `yes` when prompted).*

---

## 🧪 Testing the Bot
Once deployed, you don't have to wait until 8:00 AM to see if it works. You can trigger the Cloud Scheduler job manually from your terminal:

```bash
gcloud scheduler jobs run daily-billing-trigger --location=asia-southeast2
```

Check your Telegram app! You should receive a message looking like this:

> ☁️ **GCP Billing Update (May 2026)**  
> 💰 **Total Spend:** $145.50  
> 🕒 **Data fresh as of:** _11 May 2026, 05:00 WIB_  
>   
> 📊 **Breakdown by Service:**  
> 🔹 Compute Engine: $95.00  
> 🔹 Cloud SQL: $35.25  
> 🔹 Cloud Storage: $10.00  
> 🔹 Cloud Run: $4.00  
> 🔹 Networking: $1.00  
> 🔹 _Other Services_: $0.25  

---

## 🔐 Security Notes
* This project complies with `constraints/storage.uniformBucketLevelAccess` organization policies by enforcing Uniform Bucket-Level Access on the Cloud Storage deployment bucket.
* The Cloud Function service account only has `BigQuery Data Viewer` and `BigQuery Job User` roles.
* The Cloud Scheduler service account only has the `Cloud Run Invoker` role to trigger the function securely via OIDC.
