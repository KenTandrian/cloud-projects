# Get All CIDR IP Ranges

Extract all CIDR IP ranges for all networks in an organization using Google Cloud Asset Inventory.

## Command

Replace `[org_id]` with your organization ID.
```bash
gcloud asset search-all-resources \
  --scope="organizations/[org_id]" \
  --asset-types="compute.googleapis.com/Subnetwork" \
  --order-by="createTime" \
  --read-mask="name,versionedResources" \
  --format="csv(name, versionedResources.resource.ipCidrRange)" > output.csv
```

## Infrastructure as Code

You can also run `terraform apply` and the output will give you a list of IP ranges.
