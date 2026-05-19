"use client";

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

  const isPending = createMutation.isPending || updateMutation.isPending;

  const handleSubmit = async (data: ZCreateProduct) => {
    if (isEdit && product) {
      await updateMutation.mutateAsync({ id: product.id, data });
    } else {
      await createMutation.mutateAsync(data);
    }
    onOpenChange(false);
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md" showCloseButton={false}>
        <DialogHeader>
          <DialogTitle className="text-[15px] font-semibold text-foreground">
            {isEdit ? "Edit Product" : "Add Product"}
          </DialogTitle>
        </DialogHeader>
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
