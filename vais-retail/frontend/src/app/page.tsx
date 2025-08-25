"use client";

import { ProductCard } from "@/components/product-card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { ISearchResult } from "@/lib/types";
import Link from "next/link";
import { useState } from "react";

export default function Home() {
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<ISearchResult[]>([]);
  const [loading, setLoading] = useState(false);

  const handleSearch = async () => {
    if (!query) return;
    setLoading(true);
    const response = await fetch(
      `/api/search?query=${encodeURIComponent(query)}`
    );
    const data: ISearchResult[] = await response.json();
    setResults(data || []);
    setLoading(false);
  };

  return (
    <main className="container mx-auto p-4">
      <h1 className="text-3xl font-bold mb-4">FyberInvest Search</h1>
      <div className="flex w-full max-w-sm items-center space-x-2 mb-8">
        <Input
          type="text"
          placeholder="e.g., technology stocks"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          onKeyDown={(e) => e.key === "Enter" && handleSearch()}
        />
        <Button onClick={handleSearch} disabled={loading}>
          {loading ? "Searching..." : "Search"}
        </Button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {results.map((result) => (
          <Link href={`/product/${result.id}`} key={result.id}>
            <ProductCard
              product={{
                ...result.product,
                id: result.id,
              }}
            />
          </Link>
        ))}
      </div>
    </main>
  );
}
