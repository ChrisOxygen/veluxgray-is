"use client";

import { Pencil, Archive, ArchiveRestore, Loader2 } from "lucide-react";
import { cn } from "@/shared/lib/utils";
import { InventoryBadge } from "./InventoryBadge";
import { useArchiveProduct } from "@/features/products/hooks/use-archive-product";
import type { Product } from "@/features/products/types";

const TABLE_COLUMNS = [
  { label: "Product", width: "35%" },
  { label: "SKU", width: "14%" },
  { label: "Selling Price", width: "14%" },
  { label: "Inventory", width: "14%" },
  { label: "Status", width: "13%" },
  { label: "", width: "10%" },
] as const;

function formatPrice(price: string) {
  return new Intl.NumberFormat("en-NG", {
    style: "currency",
    currency: "NGN",
    minimumFractionDigits: 0,
    maximumFractionDigits: 2,
  }).format(parseFloat(price));
}

interface ProductsTableProps {
  products: Product[];
  isFetching?: boolean;
  onEdit: (product: Product) => void;
}

export function ProductsTable({
  products,
  isFetching = false,
  onEdit,
}: ProductsTableProps) {
  const archiveMutation = useArchiveProduct();

  if (!isFetching && products.length === 0) {
    return (
      <div className="rounded-xl bg-card border border-border flex flex-col items-center justify-center py-16 gap-2">
        <p className="text-[14px] font-medium text-foreground">No products found</p>
        <p className="text-[12.5px] text-muted-foreground">
          Add your first product to get started.
        </p>
      </div>
    );
  }

  return (
    <div className="rounded-xl overflow-hidden relative bg-card border border-border">
      {isFetching && (
        <div className="absolute top-3 right-3 z-10">
          <Loader2 size={14} className="animate-spin text-muted-foreground" />
        </div>
      )}

      <div className="overflow-x-auto">
        <table
          className={cn(
            "w-full border-collapse min-w-170 table-fixed transition-opacity duration-150",
            isFetching && "opacity-60",
          )}
        >
          <colgroup>
            {TABLE_COLUMNS.map(({ label, width }) => (
              <col key={label} style={{ width }} />
            ))}
          </colgroup>

          <thead>
            <tr className="bg-accent-subtle border-b border-border">
              {TABLE_COLUMNS.map(({ label }) => (
                <th key={label} className="px-4 py-2.5 text-left">
                  {label && (
                    <span className="text-[11px] font-semibold uppercase tracking-wider whitespace-nowrap text-muted-foreground font-heading">
                      {label}
                    </span>
                  )}
                </th>
              ))}
            </tr>
          </thead>

          <tbody>
            {products.map((product, index) => {
              const isLast = index === products.length - 1;
              const isArchiving =
                archiveMutation.isPending &&
                archiveMutation.variables?.id === product.id;

              return (
                <tr
                  key={product.id}
                  className={cn(
                    "transition-colors duration-100 hover:bg-accent-subtle/50",
                    !isLast && "border-b border-border",
                    !product.isActive && "opacity-60",
                  )}
                >
                  {/* Name */}
                  <td className="px-4 py-3 max-w-0">
                    <div className="flex items-center gap-2.5 min-w-0">
                      {product.imageUrl ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={product.imageUrl}
                          alt={product.name}
                          className="w-7 h-7 rounded-md object-cover shrink-0 border border-border"
                        />
                      ) : (
                        <div className="w-7 h-7 rounded-md shrink-0 bg-muted border border-border flex items-center justify-center">
                          <span className="text-[9px] font-bold text-muted-foreground uppercase">
                            {product.name.slice(0, 2)}
                          </span>
                        </div>
                      )}
                      <span className="text-[13px] font-medium truncate text-foreground">
                        {product.name}
                      </span>
                    </div>
                  </td>

                  {/* SKU */}
                  <td className="px-4 py-3 max-w-0">
                    {product.sku ? (
                      <span className="inline-block px-1.5 py-0.5 rounded text-[10.5px] font-mono font-medium bg-muted border border-border text-text-secondary truncate">
                        {product.sku}
                      </span>
                    ) : (
                      <span className="text-[11.5px] text-muted-foreground">—</span>
                    )}
                  </td>

                  {/* Selling Price */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span className="text-[13px] font-semibold text-foreground">
                      {formatPrice(product.sellingPrice)}
                    </span>
                  </td>

                  {/* Inventory */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <InventoryBadge
                      count={product.inventoryCount}
                      threshold={product.lowStockThreshold}
                    />
                  </td>

                  {/* Status */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <span
                      className={cn(
                        "inline-block px-2.5 py-0.5 rounded-full text-[11px] font-medium border",
                        product.isActive
                          ? "bg-[#EBF5F0] border-[#2D7A51]/20 text-[#2D7A51]"
                          : "bg-muted border-border-strong text-muted-foreground",
                      )}
                    >
                      {product.isActive ? "Active" : "Archived"}
                    </span>
                  </td>

                  {/* Actions */}
                  <td className="px-4 py-3 whitespace-nowrap">
                    <div className="flex items-center gap-1 justify-end">
                      <button
                        type="button"
                        onClick={() => onEdit(product)}
                        className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-text-secondary"
                        title="Edit"
                      >
                        <Pencil size={12} />
                      </button>
                      <button
                        type="button"
                        disabled={isArchiving}
                        onClick={() =>
                          archiveMutation.mutate({
                            id: product.id,
                            restore: !product.isActive,
                          })
                        }
                        className="w-6 h-6 flex items-center justify-center rounded-md transition-colors hover:bg-muted text-muted-foreground hover:text-text-secondary disabled:opacity-40"
                        title={product.isActive ? "Archive" : "Restore"}
                      >
                        {isArchiving ? (
                          <Loader2 size={12} className="animate-spin" />
                        ) : product.isActive ? (
                          <Archive size={12} />
                        ) : (
                          <ArchiveRestore size={12} />
                        )}
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
    </div>
  );
}
