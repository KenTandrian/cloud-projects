import {
  PredictionServiceClient,
  ProductServiceClient,
} from "@google-cloud/retail";

import { ProductCard } from "@/components/product-card";
import { Separator } from "@/components/ui/separator";
import { protoJsonToJs } from "@/lib/proto";

const predClient = new PredictionServiceClient();
const prodClient = new ProductServiceClient();
const projectId = process.env.GCLOUD_PROJECT;

async function getRecommendations(
  modelType: "oyml" | "fbt0",
  productId: string
) {
  const placement = `projects/${projectId}/locations/global/catalogs/default_catalog/servingConfigs/${modelType}`;
  const [response] = await predClient.predict({
    placement,
    userEvent: {
      eventType: "detail-page-view",
      visitorId: "demo-visitor-id",
      productDetails: [{ product: { id: productId } }],
    },
    params: {
      returnProduct: { boolValue: true },
    },
    validateOnly: true,
  });
  return response.results ?? [];
}

// Main page component
export default async function ProductPage({
  params,
}: PageProps<"/product/[id]">) {
  const productId = (await params).id;
  const productName = `projects/${projectId}/locations/global/catalogs/default_catalog/branches/default_branch/products/${productId}`;

  // Fetch the main product, OYML, and FBT recommendations in parallel
  const [productResponse, oymlRecs, fbtRecs] = await Promise.all([
    prodClient.getProduct({ name: productName }),
    getRecommendations("oyml", productId),
    getRecommendations("fbt0", productId),
  ]);

  const product = productResponse[0];

  return (
    <main className="container mx-auto p-4">
      <div className="flex items-center space-x-4 mb-8">
        {product.images?.[0]?.uri && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={product.images[0].uri}
            alt="logo"
            className="w-16 h-16 rounded-full"
          />
        )}
        <div>
          <h1 className="text-3xl font-bold">
            {product.title} ({product.id})
          </h1>
          <p className="text-xl text-muted-foreground">
            ${product.priceInfo?.price?.toFixed(2)}
          </p>
        </div>
      </div>

      <Separator className="my-8" />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Others You May Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {oymlRecs.map((rec) => (
            <ProductCard
              key={rec.id}
              product={protoJsonToJs(rec.metadata?.product)}
            />
          ))}
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Frequently Bought Together
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {fbtRecs.map((rec) => (
            <ProductCard
              key={rec.id}
              product={protoJsonToJs(rec.metadata?.product)}
            />
          ))}
        </div>
      </section>
    </main>
  );
}
