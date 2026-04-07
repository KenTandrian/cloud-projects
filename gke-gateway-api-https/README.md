# GKE Gateway API with HTTPS Setup

This repository contains the Kubernetes manifests required to expose applications on GKE using the native **Kubernetes Gateway API** (`gke-l7-global-external-managed`).

By using the native GKE Gateway instead of standard Ingress, we achieve:

1. **Google-Managed Wildcard Certificates:** Zero-maintenance, auto-renewing wildcard SSL (`*.yourdomain.com`) backed by Google Cloud Certificate Manager.
2. **Global Edge Infrastructure:** Traffic routes through Google's Global External Application Load Balancer (Envoy-based) with Cloud Armor DDoS protection.
3. **Decoupled Routing:** Platform admins manage the Gateway; Developers manage their own `HTTPRoute` files.

> **⚠️ Cloud Service Mesh Note:** Because the Google Cloud Load Balancer initiates traffic from outside the cluster, it does not possess an Istio mTLS certificate. To use this native architecture with Cloud Service Mesh, your application namespaces **must** be left in `PERMISSIVE` mTLS mode so the load balancer's traffic and health checks are not rejected by the Envoy sidecars.

## Step 1: Create the Wildcard Certificate (Google Cloud CLI)

Because we want a Wildcard Certificate, we must use **DNS Authorization** via the Google Cloud Certificate Manager. This allows Google to verify domain ownership via a DNS record, which is perfect if your DNS is hosted externally (like Vercel, Cloudflare, or Route53).

**1. Create the DNS Authorization:**

```bash
gcloud certificate-manager dns-authorizations create my-dns-auth \
    --domain="yourdomain.com"
```

**2. Retrieve the CNAME Record:**

```bash
gcloud certificate-manager dns-authorizations describe my-dns-auth
```

_Action:_ Copy the `dnsResourceRecord` (Name and Data) from the output. Go to your DNS provider (e.g., Vercel) and create this CNAME record.

**3. Request the Wildcard Certificate:**

```bash
gcloud certificate-manager certificates create my-wildcard-cert \
    --domains="*.yourdomain.com,yourdomain.com" \
    --dns-authorizations=my-dns-auth
```

**4. Create the Certificate Map & Entry:**
This groups the certificate so the Gateway API can easily attach it.

```bash
gcloud certificate-manager maps create my-wildcard-map

gcloud certificate-manager maps entries create wildcard-entry \
    --map="my-wildcard-map" \
    --certificates="my-wildcard-cert" \
    --hostname="*.yourdomain.com"
```

## Step 2: Deploy the Gateway (The Edge)

Deploy the Gateway infrastructure. It is best practice to place this in a dedicated networking namespace (e.g., `edge-routing`) rather than the `default` namespace.

```bash
kubectl apply -f namespace.yaml
kubectl apply -f gateway.yaml
```

## Step 3: Deploy the Application Routes

Developers can now expose their applications by simply dropping an `HTTPRoute` into their app's namespace. The Gateway dynamically picks this up and routes the traffic securely using the wildcard certificate.

```bash
kubectl apply -f http-route.yaml
```

## Step 4: Fix the "No Healthy Upstream" Trap (Health Checks)

Unlike legacy GKE `Ingress`, the Kubernetes Gateway API **does not infer health checks** from your Deployment's `readinessProbe`. By default, it blindly pings the root path (`/`) on your Service port.

If your application redirects users (e.g., `301 Redirect` to `/login`), the Load Balancer will mark your app as dead and throw a `502 Bad Gateway` or `no healthy upstream` error.

**The Fix:** You must explicitly define a `HealthCheckPolicy` to tell the Load Balancer which endpoint returns a `200 OK`.

```bash
kubectl apply -f hc-policy.yaml
```

## Step 5: Verification & Cutover

1. Retrieve the Public IP address of your new Gateway:
   ```bash
   kubectl get gateway external-gateway -n edge-routing
   ```
2. Open the **Google Cloud Console -> Load Balancing**. Wait until the Backend Services show a green checkmark (indicating the `HealthCheckPolicy` successfully reached your pods).
3. Update your DNS provider (A-Records) to point your subdomains to the new Gateway IP address.
4. Enjoy your infinitely scalable, wildcard-secured Gateway architecture!
