"use client";

import { useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/shared/components/ui/dialog";
import { ProductForm } from "./ProductForm";
import { useCreateProduct } from "@/features/products/hooks/use-create-product";
import { useUpdateProduct } from "@/features/products/hooks/use-update-product";
import type { ZCreateProduct } from "@/features/products/schemas";
import type { Product } from "@/features/products/types";

interface AddProductDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  product?: Product | null;
}

export function AddProductDialog({ open, onOpenChange, product }: AddProductDialogProps) {
  const isEdit = !!product;
  const createMutation = useCreateProduct();
  const updateMutation = useUpdateProduct();
  const [submitError, setSubmitError] = useState<string | null>(null);

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (data: ZCreateProduct) => {
    setSubmitError(null);
    try {
      if (isEdit && product) {
        await updateMutation.mutateAsync({ id: product.id, data });
      } else {
        await createMutation.mutateAsync(data);
      }
      onOpenChange(false);
    } catch (err) {
      setSubmitError(err instanceof Error ? err.message : "Something went wrong. Please try again.");
    }
  };

  return (
    <Dialog open={open} onOpenChange={(v) => { setSubmitError(null); onOpenChange(v); }}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold text-foreground">
            {isEdit ? "Edit Product" : "Add Product"}
          </DialogTitle>
        </DialogHeader>
        {submitError && (
          <p className="rounded-md bg-error-subtle px-3 py-2 text-[12.5px] text-destructive">
            {submitError}
          </p>
        )}
        <ProductForm
          product={product}
          onSubmit={handleSubmit}
          onCancel={() => onOpenChange(false)}
          isPending={isPending}
        />
      </DialogContent>
    </Dialog>
  );
}
