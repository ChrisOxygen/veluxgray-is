"use client";

import { useState } from "react";
import { useSearchParams } from "next/navigation";
import { Plus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ProductMetrics } from "./ProductMetrics";
import { ProductsFilters } from "./ProductsFilters";
import { ProductsTable } from "./ProductsTable";
import { AddProductDialog } from "./AddProductDialog";
import { useProducts } from "@/features/products/hooks/use-products";
import type { Product } from "@/features/products/types";

export function ProductsView() {
  const searchParams = useSearchParams();
  const q = searchParams.get("q") ?? undefined;
  const status = searchParams.get("status")?.toUpperCase() ?? "ALL";

  const { data, isPending, isFetching } = useProducts({ q, status });

  const [dialogState, setDialogState] = useState<{
    open: boolean;
    product: Product | null;
  }>({ open: false, product: null });

  const openCreate = () => setDialogState({ open: true, product: null });
  const openEdit = (product: Product) => setDialogState({ open: true, product });
  const closeDialog = () => setDialogState((s) => ({ ...s, open: false }));

  return (
    <div className="p-4 sm:p-6 flex flex-col gap-5">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div>
          <h1 className="text-[20px] sm:text-[22px] font-bold tracking-tight text-foreground font-heading">
            Products
          </h1>
          <p className="text-[12.5px] text-muted-foreground mt-0.5">
            Manage your inventory and product catalogue.
          </p>
        </div>
        <Button size="sm" onClick={openCreate} className="shrink-0 gap-1.5">
          <Plus size={14} />
          Add Product
        </Button>
      </div>

      {/* Metrics */}
      <ProductMetrics stats={data?.stats} isPending={isPending} />

      {/* Filters */}
      <ProductsFilters />

      {/* Table */}
      <ProductsTable
        products={data?.products ?? []}
        isFetching={isFetching && !isPending}
        onEdit={openEdit}
      />

      {/* Dialog */}
      <AddProductDialog
        open={dialogState.open}
        onOpenChange={(open) => {
          if (!open) closeDialog();
        }}
        product={dialogState.product}
      />
    </div>
  );
}
