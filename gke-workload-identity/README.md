# Authenticate to Google Cloud APIs from GKE Workloads
Implementation of Workload Identity Pool in GKE with a sample Go application.

## Introduction
This codebase demonstrates how to authenticate to Google Cloud APIs from GKE Workloads. There are several ways to authenticate to Google Cloud from a Kubernetes cluster:

1. Storing Google Cloud service account key in Kubernetes cluster.
   - Pods will be able to access the key by mounting the secret as volume.
   - This way is not recommended as it imposes a security risk.

2. Impersonating Google Cloud service account.
   - Kubernetes service account will act as the Google Cloud service account it is annotated with.
   - This way involves creating service accounts in Kubernetes and Google Cloud.

3. Referencing Kubernetes service account in IAM.
   - This is the most recommended way as you don't need to create a separate service account in Google Cloud.

This guide will implement the **third option**.

## Before you begin
Set up your Google Kubernetes Engine using this [guide](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity#enable_on_clusters_and_node_pools).

The setup process involves enabling workload identity pool `[PROJECT_ID].svc.id.goog` in your Kubernetes cluster and configuring node pools to use the GKE metadata server.

Once the Kubernetes node pool is configured with GKE metadata server, the Go application that will be deployed in the Kubernetes pods will be able to authenticate with [Application Default Credentials (ADC)](https://cloud.google.com/docs/authentication/provide-credentials-adc).

## Variables
You can change these variables to suit your needs.
```bash
export CLUSTER_NAME=standard-gke-1
export LOCATION=asia-southeast2
export BUCKET=sample-gcs-bucket
export PROJECT_ID=my-project-id
export PROJECT_NUMBER=1234567890
export NAMESPACE=ns-1
export SERVICE_ACCOUNT=sa-1
```

## Configure Kubernetes environment
1. Get credentials for your cluster.
```bash
gcloud container clusters get-credentials $CLUSTER_NAME \
    --location=LOCATION
```
2. Create a namespace to use for the Kubernetes service account. You can also use the default namespace or any existing namespace.
```bash
kubectl apply -f kubernetes/namespace.yaml
```
3. Create a Kubernetes ServiceAccount for your application to use. You can also use any existing Kubernetes ServiceAccount in any namespace.
```bash
kubectl apply -f kubernetes/service-account.yaml
```

## Configure sample GCS bucket
1. Create an empty GCS bucket
```bash
gcloud storage buckets create gs://$BUCKET
```
2. The Go application will need `storage.buckets.get` permission. Therefore, grant the Storage Legacy Bucket Reader (roles/storage.legacyBucketReader) to the service account.
```bash
gcloud storage buckets add-iam-policy-binding gs://$BUCKET \
    --role=roles/storage.legacyBucketReader \
    --member=principal://iam.googleapis.com/projects/$PROJECT_NUMBER/locations/global/workloadIdentityPools/$PROJECT_ID.svc.id.goog/subject/ns/$NAMESPACE/sa/$SERVICE_ACCOUNT \
    --condition=None
```

## Deploy sample Go application
1. Change the `bucketName` variable in `main.go` file.
2. Create an Artifact Registry repository.
```bash
export REPO=my-repo
gcloud artifacts repositories create $REPO --location=$LOCATION
```
2. Build the Docker container with Google Cloud Build.
```bash
gcloud builds submit --region=$LOCATION \
    --tag=$LOCATION-docker.pkg.dev/$PROJECT_ID/$REPO/go-http-server . 
```
3. Deploy to Kubernetes cluster.
```bash
kubectl apply -f kubernetes/app.yaml
```

## Verify the connection
1. Get the IP address of the Kubernetes service.
2. Go to `http://[IP_ADDRESS]:8080`. You should see "Hello world!" message.
3. Go to `http://[IP_ADDRESS]:8080/gcs`. You should see your bucket details.

## Troubleshooting
If the app is not working as expected, go to Kubernetes Engine &rarr; Workloads and select your deployment. Open "Logs" tab to check the logs.

### Google API 403 Error
```
googleapi: Error 403: Caller does not have storage.buckets.get access to the Google Cloud Storage bucket. Permission 'storage.buckets.get' denied on resource (or it may not exist)., forbidden
```
This error means that your IAM policy binding is not set up correctly.

## References
- [Authenticate to Google Cloud APIs from GKE workloads](https://cloud.google.com/kubernetes-engine/docs/how-to/workload-identity).
- [Authenticate for using client libraries](https://cloud.google.com/docs/authentication/client-libraries).

##

2024 &copy; Ken Tandrian. All rights reserved.
