import { prisma } from "../../lib/prisma";
import { slugify } from "@ecommerce/shared-utils";
import { CloudinaryService } from "../../lib/cloudinary";
import type { CollectionModel } from "./model";
import type { Fabric, FitType, SleeveStyle } from "../../../generated/prisma/client";

const COLLECTION_INCLUDE = {
  image: true,
  banner: true,
  _count: { select: { products: true } },
} as const;

const COLLECTION_WITH_CHILDREN = {
  image: true,
  banner: true,
  _count: { select: { products: true } },
  children: {
    where: { isActive: true },
    include: {
      image: true,
      banner: true,
      _count: { select: { products: true } },
    },
    orderBy: { position: "asc" as const },
  },
} as const;

export abstract class CollectionService {
  static async list() {
    const collections = await prisma.collection.findMany({
      where: { parentId: null }, // Only top-level collections
      include: COLLECTION_WITH_CHILDREN,
      orderBy: [{ position: "asc" }, { nameEn: "asc" }],
    });

    // Calculate total products for parent (own + children's)
    return collections.map((col) => {
      const childrenProductCount = col.children.reduce(
        (sum, child) => sum + (child._count?.products ?? 0),
        0
      );
      return {
        ...col,
        _count: {
          products: col._count.products + childrenProductCount,
        },
      };
    });
  }

  static async listAll() {
    // Returns all collections in flat list (for product form dropdown)
    return prisma.collection.findMany({
      include: COLLECTION_INCLUDE,
      orderBy: [{ position: "asc" }, { nameEn: "asc" }],
    });
  }

  static async listForHeader() {
    const collections = await prisma.collection.findMany({
      where: { inHeader: true, isActive: true, parentId: null },
      include: {
        children: {
          where: { isActive: true },
          orderBy: { position: "asc" },
          select: {
            id: true,
            slug: true,
            nameEn: true,
            nameAr: true,
            _count: { select: { products: true } },
          },
        },
        _count: { select: { products: true } },
      },
      orderBy: { position: "asc" },
    });

    // Calculate total products for parent (own + children's)
    return collections.map((col) => {
      const childrenProductCount = col.children.reduce(
        (sum, child) => sum + (child._count?.products ?? 0),
        0
      );
      return {
        ...col,
        _count: {
          products: col._count.products + childrenProductCount,
        },
      };
    });
  }

  static async getBySlug(slug: string) {
    return prisma.collection.findUnique({
      where: { slug },
      include: {
        ...COLLECTION_INCLUDE,
        products: {
          where: { isActive: true },
          include: {
            defaultVariant: {
              include: { images: { orderBy: { position: "asc" } } },
            },
            hoverVariant: {
              include: { images: { orderBy: { position: "asc" } } },
            },
            variants: {
              where: { isActive: true },
              orderBy: { price: "asc" },
              take: 1,
            },
          },
          take: 20,
        },
      },
    });
  }

  static async getById(id: string) {
    return prisma.collection.findUnique({
      where: { id },
      include: {
        ...COLLECTION_INCLUDE,
        children: {
          include: {
            _count: { select: { products: true } },
          },
          orderBy: { position: "asc" },
        },
        products: {
          include: {
            variants: {
              select: { id: true, price: true, stock: true },
              take: 5,
            },
          },
        },
      },
    });
  }

  static async create(body: CollectionModel["createBody"]) {
    const slug = slugify(body.nameEn);
    const existingSlug = await prisma.collection.findUnique({ where: { slug } });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    return prisma.collection.create({
      data: { ...body, slug: finalSlug },
      include: COLLECTION_INCLUDE,
    });
  }

  static async update(id: string, body: CollectionModel["updateBody"]) {
    const existing = await prisma.collection.findUnique({ where: { id } });
    if (!existing) return null;

    const updateData: Record<string, unknown> = { ...body };
    if (body.nameEn && body.nameEn !== existing.nameEn) {
      const newSlug = slugify(body.nameEn);
      // Check if slug already exists (excluding current collection)
      const existingSlug = await prisma.collection.findFirst({
        where: { slug: newSlug, id: { not: id } },
      });
      updateData.slug = existingSlug ? `${newSlug}-${Date.now()}` : newSlug;
    }

    return prisma.collection.update({
      where: { id },
      data: updateData,
      include: COLLECTION_INCLUDE,
    });
  }

  static async delete(id: string) {
    const collection = await prisma.collection.findUnique({
      where: { id },
      include: { image: true, banner: true },
    });
    if (!collection) return null;

    if (collection.image) {
      await CloudinaryService.delete(collection.image.publicId);
    }

    if (collection.banner) {
      await CloudinaryService.delete(collection.banner.publicId);
    }

    await prisma.collection.delete({ where: { id } });
    return true;
  }

  // Get collections featured on homepage (for hero section)
  static async listFeaturedOnHome() {
    return prisma.collection.findMany({
      where: { isFeaturedOnHome: true, isActive: true },
      include: { image: true },
      orderBy: { homeFeaturedPosition: "asc" },
      take: 3, // 3 collections in a single row
    });
  }

  // Get products for a collection with fashion-aware filtering
  static async getProductsBySlug(
    slug: string,
    filters?: {
      fabric?: Fabric;
      occasion?: string;
      fitType?: FitType;
      sleeveStyle?: SleeveStyle;
      page?: number;
      limit?: number;
    }
  ) {
    const page = filters?.page ?? 1;
    const limit = filters?.limit ?? 12;
    const skip = (page - 1) * limit;

    // Build where clause for products
    const productWhere: any = {
      isActive: true,
    };

    // Add fashion filters (AND-combined)
    if (filters?.fabric || filters?.fitType || filters?.sleeveStyle) {
      productWhere.fashionAttributes = {};
      if (filters.fabric) {
        productWhere.fashionAttributes.fabric = filters.fabric;
      }
      if (filters.fitType) {
        productWhere.fashionAttributes.fitType = filters.fitType;
      }
      if (filters.sleeveStyle) {
        productWhere.fashionAttributes.sleeveStyle = filters.sleeveStyle;
      }
    }

    if (filters?.occasion) {
      productWhere.occasions = {
        some: {
          occasion: { slug: filters.occasion },
        },
      };
    }

    // Get collection with filtered products
    const collection = await prisma.collection.findUnique({
      where: { slug },
      include: {
        image: true,
        banner: true,
        products: {
          where: productWhere,
          include: {
            fashionAttributes: {
              select: {
                fabric: true,
                fitType: true,
                sleeveStyle: true,
              },
            },
            occasions: {
              include: {
                occasion: {
                  select: {
                    slug: true,
                    nameEn: true,
                    nameAr: true,
                  },
                },
              },
              orderBy: { position: "asc" },
            },
            defaultVariant: {
              include: { images: { orderBy: { position: "asc" } } },
            },
            hoverVariant: {
              include: { images: { orderBy: { position: "asc" } } },
            },
            variants: {
              where: { isActive: true },
              orderBy: { price: "asc" },
              take: 1,
            },
          },
          orderBy: { position: "asc" },
          skip,
          take: limit,
        },
        _count: {
          select: { products: { where: productWhere } },
        },
      },
    });

    if (!collection) return null;

    // Get available filters for this collection
    const collectionProducts = await prisma.collection.findUnique({
      where: { slug },
      select: {
        products: {
          where: { isActive: true },
          select: {
            fashionAttributes: {
              select: { fabric: true, fitType: true, sleeveStyle: true },
            },
            occasions: {
              include: {
                occasion: {
                  select: { slug: true },
                },
              },
            },
          },
        },
      },
    });

    // Extract unique filter values
    const fabrics = new Set<string>();
    const fitTypes = new Set<string>();
    const sleeveStyles = new Set<string>();
    const occasions = new Set<string>();

    for (const product of collectionProducts?.products ?? []) {
      if (product.fashionAttributes) {
        if (product.fashionAttributes.fabric) fabrics.add(product.fashionAttributes.fabric);
        if (product.fashionAttributes.fitType) fitTypes.add(product.fashionAttributes.fitType);
        if (product.fashionAttributes.sleeveStyle) sleeveStyles.add(product.fashionAttributes.sleeveStyle);
      }
      for (const occ of product.occasions) {
        if (occ.occasion?.slug) occasions.add(occ.occasion.slug);
      }
    }

    return {
      ...collection,
      products: collection.products,
      total: collection._count.products,
      page,
      limit,
      availableFilters: {
        fabrics: Array.from(fabrics).sort(),
        fitTypes: Array.from(fitTypes).sort(),
        sleeveStyles: Array.from(sleeveStyles).sort(),
        occasions: Array.from(occasions).sort(),
      },
    };
  }
}
