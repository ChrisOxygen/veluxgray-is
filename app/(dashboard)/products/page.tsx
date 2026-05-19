import { Suspense } from "react";
import { ProductsView } from "@/features/products/components/ProductsView";

export default function ProductsPage() {
  return (
    <Suspense>
      <ProductsView />
    </Suspense>
  );
}
