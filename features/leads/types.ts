export type LeadStatus = "FRESH" | "CONTACTED" | "CONVERTED" | "LOST";

export type Sale = {
  id: string;
  leadId: string;
  dispatchFee: string;
  createdAt: string;
  updatedAt: string;
};

export type Lead = {
  id: string;
  productId: string;
  customerName: string;
  phone: string;
  email: string | null;
  state: string | null;
  city: string | null;
  deliveryAddress: string | null;
  quantity: number;
  status: LeadStatus;
  sourceUrl: string | null;
  notes: string | null;
  whatsappSent: boolean;
  triggerRunId: string | null;
  createdAt: string;
  updatedAt: string;
  product: {
    id: string;
    name: string;
    sku: string | null;
    price: string;
  };
  sale: Sale | null;
};

export type LeadsResponse = {
  leads: Lead[];
  total: number;
};
