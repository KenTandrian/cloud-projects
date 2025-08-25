import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { IProduct } from "@/lib/types";

export function ProductCard({ product }: { product?: IProduct | null }) {
  const logo = product?.images?.[0]?.uri;

  return (
    <Card className="justify-between">
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium line-clamp-2">{product?.title ?? product?.id}</CardTitle>
        {logo && (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={logo}
            alt={`${product?.title} logo`}
            className="w-8 h-8 rounded-full"
          />
        )}
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">{product?.id}</div>
        <p className="text-xs text-muted-foreground">
          ${product?.priceInfo?.price?.toFixed(2)}
        </p>
      </CardContent>
    </Card>
  );
}
