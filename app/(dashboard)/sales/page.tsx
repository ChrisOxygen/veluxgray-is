import { Suspense } from "react";
import { SalesView } from "@/features/sales/components/SalesView";

export default function SalesPage() {
  return (
    <Suspense>
      <SalesView />
    </Suspense>
  );
}
