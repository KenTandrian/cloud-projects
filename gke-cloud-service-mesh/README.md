# Managed Cloud Service Mesh on GKE Autopilot

This Terraform configuration provisions **Managed Cloud Service Mesh** on an existing Google Kubernetes Engine (GKE) Autopilot cluster.

Because GKE Autopilot restricts direct node access, this script uses Google's fully managed offering (`MANAGEMENT_AUTOMATIC`), meaning Google runs the Control Plane (Traffic Director) outside your cluster and manages the proxy lifecycle for you.

## Prerequisites

- Terraform installed
- Authenticated to Google Cloud (`gcloud auth application-default login`)
- An existing GKE Autopilot cluster

## 🚀 Step 1: Apply the Terraform

1. Initialize Terraform:
   ```bash
   terraform init
   ```
2. Create a `terraform.tfvars` file or pass the variables directly:
   ```hcl
   project_id       = "your-gcp-project-id"
   cluster_name     = "your-autopilot-cluster-name"
   cluster_location = "us-central1" # Or your specific region
   ```
3. Plan and apply:
   ```bash
   terraform apply
   ```
   _(Note: Provisioning the managed mesh can take 10-15 minutes on Google's backend)._

## 🛠️ Step 2: Next Steps (Kubernetes Configuration)

Terraform installs the "Air Traffic Control" tower, but it **does not** automatically inject Envoy proxies into your running applications. You must explicitly tell the Mesh which namespaces to protect and restart your pods.

### 1. Label your Namespace

Label the namespace where your applications (e.g., `my-namespace` and `redis`) live. This turns the namespace into a "Mesh Zone."

```bash
kubectl label namespace my-namespace istio-injection=enabled
```

### 2. Verify Database Port Naming (Best Practice for Redis/TCP)

Modern Cloud Service Mesh uses **Automatic Protocol Sniffing**. If you leave a port unnamed, the Envoy proxy intercepts the first few bytes of traffic to "guess" the protocol (HTTP vs. TCP).

While this works for standard web traffic, relying on sniffing for databases is the most common cause of `ECONNRESET` errors:

- **Server-First Protocols (Postgres, MySQL):** The app and the proxy both sit in silence waiting for the database to speak first, creating a timeout standoff.
- **Client-First Protocols (Redis):** The proxy's sniffing delay can trigger strict timeouts in your application's database client, or the raw traffic can be accidentally misidentified as HTTP.

To bypass the sniffing phase and ensure an instant, stable connection, it is a strong **best practice** to explicitly prefix TCP database Service ports with `tcp-`.

Check your Redis `Service.yaml` and add the `tcp-` prefix:

```yaml
apiVersion: v1
kind: Service
metadata:
  name: redis
  namespace: my-namespace
spec:
  ports:
    - name: tcp-redis # <--- Bypasses sniffing for a stable TCP connection
      port: 6379
      targetPort: 6379
```

_If you updated this, apply the change: `kubectl apply -f your-redis-service.yaml`_

### 3. Restart the Deployments to Inject Proxies

The namespace label only affects _new_ pods. You must restart your existing deployments so Kubernetes recreates them, allowing the Mesh to inject the Envoy sidecar container into them.

**First, restart the Database (Redis):**

```bash
kubectl rollout restart deployment redis -n my-namespace
```

_Wait for the pod to come back up. You can verify the sidecar is injected by checking that the pod has `2/2` containers ready:_

```bash
kubectl get pods -n my-namespace -w
```

**Second, restart the Application:**
Once the database has its sidecar, restart the app so it can establish a secure, mTLS-encrypted connection through its own sidecar:

```bash
kubectl rollout restart deployment <app-deployment-name> -n my-namespace
```

## 🔒 Step 3: Security - Enforcing STRICT mTLS (Zero-Trust)

By default, Cloud Service Mesh uses **Permissive Auto-mTLS**.

- **Auto-upgrades:** Because both your app and Redis now have Envoy sidecars, they will automatically detect each other and encrypt all traffic between them using mutual TLS (mTLS). No certificates to manage!
- **Permissive Mode:** However, Redis will still accept _unencrypted_ connections from legacy pods that do not have sidecars yet.

Once you are confident that all pods in your namespace are successfully running sidecars (showing `2/2`), you can flip the switch to establish a true Zero-Trust environment by rejecting all unencrypted traffic.

Apply the `PeerAuthentication` policy to enforce **STRICT** mTLS across the namespace:

```bash
kubectl apply -f k8s/strict-mtls.yaml
```

### Verification

Once both pods are restarted and the `STRICT` policy is applied:

1. Your application is fully integrated into the Cloud Service Mesh.
2. Traffic between your app and Redis is automatically routed via the Envoy proxies.
3. The connection is fully secured with mTLS.
4. Any external or unencrypted attempt to access your Redis pod directly will be instantly blocked by the sidecar proxy!
