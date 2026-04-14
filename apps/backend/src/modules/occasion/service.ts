import { prisma } from "../../lib/prisma";
import type { OccasionModel } from "./model";

type ServiceError = { ok: false; error: string; status: number };
type ServiceOk<T> = { ok: true; data: T };
type ServiceResult<T> = ServiceOk<T> | ServiceError;

export abstract class OccasionService {
  static async list(isActive?: boolean): Promise<ServiceResult<any[]>> {
    const where: Record<string, unknown> = {};
    if (isActive !== undefined) where.isActive = isActive;

    const occasions = await prisma.occasion.findMany({
      where,
      orderBy: { position: "asc" },
      include: {
        _count: { select: { products: true } },
      },
    });

    return { ok: true, data: occasions };
  }

  static async getById(id: string): Promise<ServiceResult<any>> {
    const occasion = await prisma.occasion.findUnique({
      where: { id },
      include: {
        _count: { select: { products: true } },
      },
    });

    if (!occasion) return { ok: false, error: "Occasion not found", status: 404 };

    return { ok: true, data: occasion };
  }

  static async create(data: OccasionModel["createBody"]): Promise<ServiceResult<any>> {
    const existing = await prisma.occasion.findUnique({ where: { slug: data.slug } });
    if (existing) return { ok: false, error: "Occasion with this slug already exists", status: 409 };

    const occasion = await prisma.occasion.create({
      data: {
        slug: data.slug,
        nameEn: data.nameEn,
        nameAr: data.nameAr,
        descriptionEn: data.descriptionEn,
        descriptionAr: data.descriptionAr,
        isActive: data.isActive ?? true,
        position: data.position ?? 0,
      },
    });

    return { ok: true, data: occasion };
  }

  static async update(id: string, data: OccasionModel["updateBody"]): Promise<ServiceResult<any>> {
    const existing = await prisma.occasion.findUnique({ where: { id } });
    if (!existing) return { ok: false, error: "Occasion not found", status: 404 };

    if (data.slug && data.slug !== existing.slug) {
      const slugConflict = await prisma.occasion.findUnique({ where: { slug: data.slug } });
      if (slugConflict) return { ok: false, error: "Occasion with this slug already exists", status: 409 };
    }

    const occasion = await prisma.occasion.update({
      where: { id },
      data,
    });

    return { ok: true, data: occasion };
  }

  static async delete(id: string): Promise<ServiceResult<true>> {
    const existing = await prisma.occasion.findUnique({
      where: { id },
      include: { _count: { select: { products: true } } },
    });

    if (!existing) return { ok: false, error: "Occasion not found", status: 404 };

    if (existing._count.products > 0) {
      return {
        ok: false,
        error: `Cannot delete occasion: ${existing._count.products} product(s) are associated with it`,
        status: 409,
      };
    }

    await prisma.occasion.delete({ where: { id } });
    return { ok: true, data: true };
  }
}
