import { z } from "zod";

// Normalizes Nigerian phone numbers to international format without +
// 08012345678 → 2348012345678 | +2348012345678 → 2348012345678 | already 234... → unchanged
function toInternational(phone: string): string {
  if (phone.startsWith("+")) return phone.slice(1);
  if (phone.startsWith("234")) return phone;
  if (phone.startsWith("0")) return "234" + phone.slice(1);
  return phone;
}

const phoneField = z
  .string()
  .min(10, "Enter a valid phone number")
  .regex(/^\d+$/, "Phone number must contain only digits")
  .transform(toInternational);

export const ZLeadWebhookPayload = z.object({
  sku: z.string().min(1, "SKU is required"),
  firstName: z.string().min(1, "First name is required"),
  lastName: z.string().optional(),
  mainPhone: phoneField,
  altPhone: z
    .string()
    .regex(/^\d+$/, "Phone number must contain only digits")
    .transform(toInternational)
    .optional(),
  quantity: z.enum(["1", "2"]).optional(),
  email: z
    .string()
    .email("Enter a valid email address")
    .optional()
    .or(z.literal("")),
  deliveryAddress: z.string().min(5, "Enter your full delivery address").optional(),
  state: z.string().optional(),
});

export type ZLeadWebhookPayload = z.infer<typeof ZLeadWebhookPayload>;
