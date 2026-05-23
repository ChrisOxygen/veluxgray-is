import { prisma } from "@/shared/lib/prisma";
import type { Prisma } from "@/prisma/generated/client/client";
import type { ZCreateProduct, ZUpdateProduct } from "@/features/products/schemas";
import type { ProductsStats } from "@/features/products/types";

interface GetProductsParams {
  q?: string;
  status?: "active" | "archived" | "all";
  limit?: number;
  page?: number;
}

export async function _getProducts({ q, status = "all", limit = 100, page = 1 }: GetProductsParams = {}) {
  const where: Prisma.ProductWhereInput = {};

  if (status === "active") where.isActive = true;
  if (status === "archived") where.isActive = false;

  if (q) {
    where.OR = [
      { name: { contains: q, mode: "insensitive" } },
      { sku: { contains: q, mode: "insensitive" } },
    ];
  }

  const skip = (page - 1) * limit;

  const [products, allProducts] = await Promise.all([
    prisma.product.findMany({ where, orderBy: { createdAt: "desc" }, take: limit, skip }),
    prisma.product.findMany({
      select: { isActive: true, inventoryCount: true, lowStockThreshold: true },
    }),
  ]);

  const stats: ProductsStats = {
    total: allProducts.length,
    active: allProducts.filter((p: { isActive: boolean }) => p.isActive).length,
    lowStock: allProducts.filter(
      (p: { isActive: boolean; inventoryCount: number; lowStockThreshold: number }) =>
        p.isActive && p.inventoryCount <= p.lowStockThreshold,
    ).length,
  };

  return { products, stats };
}

export async function _createProduct(data: ZCreateProduct) {
  return prisma.product.create({ data });
}

export async function _updateProduct(id: string, data: ZUpdateProduct) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error("NOT_FOUND");
  return prisma.product.update({ where: { id }, data });
}

export async function _archiveProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error("NOT_FOUND");
  return prisma.product.update({ where: { id }, data: { isActive: false } });
}

export async function _restoreProduct(id: string) {
  const product = await prisma.product.findUnique({ where: { id } });
  if (!product) throw new Error("NOT_FOUND");
  return prisma.product.update({ where: { id }, data: { isActive: true } });
}
