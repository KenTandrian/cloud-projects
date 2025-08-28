import google.auth
from google.api_core.client_options import ClientOptions
from google.cloud import retail_v2

# --- Configuration ---
# You can get this full product name from the "name" field in your search response
project_id = google.auth.default()[1]
PRODUCT_NAME = "projects/{project_id}/locations/global/catalogs/default_catalog/branches/0/products/PLTR"
# -------------------

def get_product_details():
    """Fetches a single product directly to verify its data was imported."""
    
    print(f"Fetching product: {PRODUCT_NAME}")
    
    client_options = ClientOptions(api_endpoint="retail.googleapis.com")
    product_client = retail_v2.ProductServiceClient(client_options=client_options)

    request = retail_v2.GetProductRequest(
        name=product_client.product_path(project_id, "global", "default_catalog", "0", PRODUCT_NAME)
    )

    try:
        product = product_client.get_product(request=request)
        print("\n--- Product Found ---")
        print("Title:", product.title)
        print("Price:", product.price_info.price)
        print("Images:", product.images)
        print("Attributes:", product.attributes)
        print("\n✅ SUCCESS: The product data was imported correctly.")
    except Exception as e:
        print("\n--- Error ---")
        print(f"Failed to retrieve product details: {e}")
        print("\n❌ FAILED: The product data may not have been imported correctly.")

if __name__ == "__main__":
    get_product_details()
