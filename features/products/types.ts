export type Product = {
  id: string;
  name: string;
  sku: string | null;
  price: string;
  inventoryCount: number;
  lowStockThreshold: number;
  imageUrl: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
};

export type ProductsStats = {
  total: number;
  active: number;
  lowStock: number;
};

export type ProductsResponse = {
  products: Product[];
  stats: ProductsStats;
};
