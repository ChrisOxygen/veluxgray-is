"use client";

import { useEffect } from "react";
import { useForm, type Resolver } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { ZCreateProductSchema, type ZCreateProduct } from "@/features/products/schemas";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import { cn } from "@/shared/lib/utils";
import type { Product } from "@/features/products/types";
import { ImageUpload } from "@/features/products/components/ImageUpload";

interface ProductFormProps {
  product?: Product | null;
  onSubmit: (data: ZCreateProduct) => void;
  onCancel: () => void;
  isPending?: boolean;
}

function FieldError({ message }: { message?: string }) {
  if (!message) return null;
  return <p className="text-[11.5px] text-destructive mt-1">{message}</p>;
}

export function ProductForm({
  product,
  onSubmit,
  onCancel,
  isPending = false,
}: ProductFormProps) {
  const isEdit = !!product;

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    watch,
    formState: { errors },
  } = useForm<ZCreateProduct>({
    resolver: zodResolver(ZCreateProductSchema) as Resolver<ZCreateProduct>,
    defaultValues: product
      ? {
          name: product.name,
          sku: product.sku ?? undefined,
          costPrice: parseFloat(product.costPrice),
          sellingPrice: parseFloat(product.sellingPrice),
          description: product.description ?? undefined,
          inventoryCount: product.inventoryCount,
          lowStockThreshold: product.lowStockThreshold,
          imageUrl: product.imageUrl ?? undefined,
        }
      : {
          inventoryCount: 0,
          lowStockThreshold: 5,
        },
  });

  useEffect(() => {
    if (product) {
      reset({
        name: product.name,
        sku: product.sku ?? undefined,
        costPrice: parseFloat(product.costPrice),
        sellingPrice: parseFloat(product.sellingPrice),
        description: product.description ?? undefined,
        inventoryCount: product.inventoryCount,
        lowStockThreshold: product.lowStockThreshold,
        imageUrl: product.imageUrl ?? undefined,
      });
    } else {
      reset({ inventoryCount: 0, lowStockThreshold: 5 });
    }
  }, [product, reset]);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="flex flex-col gap-4">
      {/* Name */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="name" className="text-[12.5px] font-medium text-foreground">
          Name <span className="text-destructive">*</span>
        </Label>
        <Input
          id="name"
          placeholder="e.g. Leather Tote Bag"
          className={cn("h-9 text-[13px]", errors.name && "border-destructive")}
          {...register("name")}
        />
        <FieldError message={errors.name?.message} />
      </div>

      {/* SKU */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="sku" className="text-[12.5px] font-medium text-foreground">
          SKU
        </Label>
        <Input
          id="sku"
          placeholder="e.g. VG-001"
          className="h-9 text-[13px] font-mono"
          {...register("sku")}
        />
        <FieldError message={errors.sku?.message} />
      </div>

      {/* Cost Price + Selling Price row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="costPrice" className="text-[12.5px] font-medium text-foreground">
            Cost Price (₦) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="costPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className={cn("h-9 text-[13px]", errors.costPrice && "border-destructive")}
            {...register("costPrice")}
          />
          <FieldError message={errors.costPrice?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label htmlFor="sellingPrice" className="text-[12.5px] font-medium text-foreground">
            Selling Price (₦) <span className="text-destructive">*</span>
          </Label>
          <Input
            id="sellingPrice"
            type="number"
            step="0.01"
            min="0"
            placeholder="0.00"
            className={cn("h-9 text-[13px]", errors.sellingPrice && "border-destructive")}
            {...register("sellingPrice")}
          />
          <FieldError message={errors.sellingPrice?.message} />
        </div>
      </div>

      {/* Description */}
      <div className="flex flex-col gap-1.5">
        <Label htmlFor="description" className="text-[12.5px] font-medium text-foreground">
          Description
        </Label>
        <Textarea
          id="description"
          rows={3}
          placeholder="Brief description of the product…"
          className={cn("text-[13px] resize-none", errors.description && "border-destructive")}
          {...register("description")}
        />
        <FieldError message={errors.description?.message} />
      </div>

      {/* Inventory + Threshold row */}
      <div className="grid grid-cols-2 gap-3">
        <div className="flex flex-col gap-1.5">
          <Label htmlFor="inventoryCount" className="text-[12.5px] font-medium text-foreground">
            Inventory
          </Label>
          <Input
            id="inventoryCount"
            type="number"
            min="0"
            placeholder="0"
            className={cn("h-9 text-[13px]", errors.inventoryCount && "border-destructive")}
            {...register("inventoryCount")}
          />
          <FieldError message={errors.inventoryCount?.message} />
        </div>

        <div className="flex flex-col gap-1.5">
          <Label
            htmlFor="lowStockThreshold"
            className="text-[12.5px] font-medium text-foreground"
          >
            Low Stock Alert
          </Label>
          <Input
            id="lowStockThreshold"
            type="number"
            min="1"
            placeholder="5"
            className={cn("h-9 text-[13px]", errors.lowStockThreshold && "border-destructive")}
            {...register("lowStockThreshold")}
          />
          <FieldError message={errors.lowStockThreshold?.message} />
        </div>
      </div>

      {/* Product Image */}
      <div className="flex flex-col gap-1.5">
        <Label className="text-[12.5px] font-medium text-foreground">Product Image</Label>
        <ImageUpload
          value={watch("imageUrl") ?? null}
          onChange={(url) => setValue("imageUrl", url ?? undefined, { shouldValidate: true })}
          error={errors.imageUrl?.message}
        />
      </div>

      {/* Footer */}
      <div className="-mx-4 -mb-4 flex flex-col-reverse gap-2 rounded-b-xl border-t border-border bg-muted/30 px-4 py-3 sm:flex-row sm:justify-end">
        <Button
          type="button"
          variant="outline"
          size="sm"
          onClick={onCancel}
          disabled={isPending}
        >
          Cancel
        </Button>
        <Button type="submit" size="sm" disabled={isPending} className="min-w-20">
          {isPending ? "Saving…" : isEdit ? "Save Changes" : "Add Product"}
        </Button>
      </div>
    </form>
  );
}
