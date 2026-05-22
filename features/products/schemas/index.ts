import { z } from "zod";

const nullableString = (schema: z.ZodString) =>
  z.preprocess((v) => (v === "" ? null : v), schema.nullable().optional());

export const ZCreateProductSchema = z.object({
  name: z.string().min(1, "Name is required").max(100, "Name is too long"),
  sku: nullableString(z.string().max(50, "SKU too long")),
  costPrice: z.coerce.number().positive("Cost price must be greater than 0"),
  sellingPrice: z.coerce.number().positive("Selling price must be greater than 0"),
  description: nullableString(z.string().max(1000, "Description is too long")),
  inventoryCount: z.coerce.number().int().min(0, "Cannot be negative").default(0),
  lowStockThreshold: z.coerce.number().int().min(1, "Must be at least 1").default(5),
  imageUrl: nullableString(z.string().url("Must be a valid URL")),
});

export type ZCreateProduct = z.infer<typeof ZCreateProductSchema>;

export const ZUpdateProductSchema = ZCreateProductSchema.partial();
export type ZUpdateProduct = z.infer<typeof ZUpdateProductSchema>;
