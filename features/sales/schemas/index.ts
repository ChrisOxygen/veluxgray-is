import { z } from "zod";

export const ZCreateSaleSchema = z.object({
  leadId: z.string().uuid("Invalid lead ID"),
  dispatchFee: z.coerce
    .number()
    .min(0, "Dispatch fee cannot be negative")
    .default(10000),
});

export const ZUpdateSaleSchema = z.object({
  dispatchFee: z.coerce.number().min(0, "Dispatch fee cannot be negative"),
});

export type ZCreateSale = z.infer<typeof ZCreateSaleSchema>;
export type ZUpdateSale = z.infer<typeof ZUpdateSaleSchema>;
