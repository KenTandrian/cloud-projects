import { ProductServiceClient } from "@google-cloud/retail";
import { cookies } from "next/headers";
import Link from "next/link";

import { EventTracker } from "@/components/event-tracker";
import { ProductCard } from "@/components/product-card";
import { Separator } from "@/components/ui/separator";
import type { Product } from "@/lib/product";
import { protoJsonToJs } from "@/lib/proto";
import { getRecommendations } from "@/lib/retail/prediction";
import { assertEnv } from "@/lib/utils";

const prodClient = new ProductServiceClient();
const projectId = assertEnv("GCLOUD_PROJECT");

export default async function ProductPage({
  params,
  searchParams,
}: PageProps<"/product/[id]">) {
  const attributionToken = (await searchParams).attributionToken as string;
  const productId = (await params).id;
  const visitorId = (await cookies()).get("visitorId")?.value ?? "";
  const productName = prodClient.productPath(
    projectId,
    "global",
    "default_catalog",
    "default_branch",
    productId
  );

  // Fetch the main product, OYML, and FBT recommendations in parallel
  const [productResponse, oymlRecs, fbtRecs, similarItemsRecs] =
    await Promise.all([
      prodClient.getProduct({ name: productName }),
      getRecommendations("others_you_may_like", productId, visitorId, {
        pageSize: 5,
      }),
      getRecommendations("frequently_bought_together", productId, visitorId, {
        pageSize: 5,
      }),
      getRecommendations("similar_items", productId, visitorId, {
        pageSize: 5,
      }),
    ]);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const product: Product = protoJsonToJs(productResponse[0] as any);

  return (
    <main className="container mx-auto p-8">
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
        <h2 className="text-2xl font-semibold mb-4">Description</h2>
        <p>{product.description}</p>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Details</h2>
        <div className="grid grid-cols-2 gap-4">
          {product.attributes &&
            Object.entries(product.attributes).map(([key, value]) => (
              <div key={key}>
                <h3 className="font-semibold">{key}</h3>
                <p>
                  {value.text?.join(", ") ||
                    value.numbers?.[0].toLocaleString()}
                </p>
              </div>
            ))}
        </div>
      </section>

      <Separator className="my-8" />

      <section>
        <h2 className="text-2xl font-semibold mb-4">Tags</h2>
        <div className="flex flex-wrap gap-2">
          {product.tags?.map((tag) => (
            <div
              key={tag}
              className="bg-gray-200 text-gray-800 text-xs font-semibold mr-2 px-2.5 py-0.5 rounded-full"
            >
              {tag}
            </div>
          ))}
        </div>
      </section>

      <Separator className="my-8" />
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Similar Investments (Peers & Competitors)
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {similarItemsRecs.results?.map((rec) => (
            <Link
              href={`/product/${rec.id}?attributionToken=${similarItemsRecs.attributionToken}`}
              key={rec.id}
            >
              <ProductCard product={protoJsonToJs(rec.metadata?.product)} />
            </Link>
          ))}
        </div>
      </section>

      <Separator className="my-8" />
      <section>
        <h2 className="text-2xl font-semibold mb-4">Others You May Like</h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {oymlRecs.results?.map((rec) => (
            <Link
              href={`/product/${rec.id}?attributionToken=${oymlRecs.attributionToken}`}
              key={rec.id}
            >
              <ProductCard product={protoJsonToJs(rec.metadata?.product)} />
            </Link>
          ))}
        </div>
      </section>

      <Separator className="my-8" />
      <section>
        <h2 className="text-2xl font-semibold mb-4">
          Frequently Bought Together
        </h2>
        <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
          {fbtRecs.results?.map((rec) => (
            <Link
              href={`/product/${rec.id}?attributionToken=${fbtRecs.attributionToken}`}
              key={rec.id}
            >
              <ProductCard product={protoJsonToJs(rec.metadata?.product)} />
            </Link>
          ))}
        </div>
      </section>

      <EventTracker
        attributionToken={attributionToken}
        eventType="detail-page-view"
        visitorId={visitorId}
        productId={productId}
      />
    </main>
  );
}
