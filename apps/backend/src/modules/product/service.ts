import { prisma } from "../../lib/prisma";
import { slugify } from "@ecommerce/shared-utils";
import { PAGINATION_DEFAULTS } from "@ecommerce/shared-utils";
import { CloudinaryService } from "../../lib/cloudinary";
import type { ProductModel } from "./model";

const VARIANT_WITH_IMAGES = {
  include: {
    images: {
      orderBy: { position: "asc" as const },
      include: { image: true },
    },
    optionValues: true, // Multi-axis selection
  },
} as const;

const PRODUCT_INCLUDE = {
  variants: {
    ...VARIANT_WITH_IMAGES,
    orderBy: { createdAt: "asc" as const },
  },
  defaultVariant: VARIANT_WITH_IMAGES,
  hoverVariant: VARIANT_WITH_IMAGES,
  collection: true,
  images: true, // Product-level images
  options: {
    include: { values: { orderBy: { position: "asc" as const } } },
    orderBy: { position: "asc" as const },
  },
  customFields: true,
  fashionAttributes: true,
  occasions: {
    include: { occasion: true },
    orderBy: { position: 'asc' as const },
  },
} as const;

// Helper to flatten variant images for frontend
function flattenVariantImages(variant: {
  images: Array<{
    id: string;
    imageId: string;
    position: number;
    image: { url: string; publicId: string; altEn: string | null; altAr: string | null };
  }>;
}) {
  return variant.images.map((link) => ({
    id: link.id,
    imageId: link.imageId,
    url: link.image.url,
    publicId: link.image.publicId,
    altEn: link.image.altEn,
    altAr: link.image.altAr,
    position: link.position,
  }));
}

// Transform product to flatten variant images
function transformProduct(product: any) {
  if (!product) return null;
  return {
    ...product,
    variants: product.variants?.map((v: any) => ({
      ...v,
      images: flattenVariantImages(v),
    })),
    defaultVariant: product.defaultVariant
      ? { ...product.defaultVariant, images: flattenVariantImages(product.defaultVariant) }
      : null,
    hoverVariant: product.hoverVariant
      ? { ...product.hoverVariant, images: flattenVariantImages(product.hoverVariant) }
      : null,
  };
}

export abstract class ProductService {
  static async list(query: ProductModel["listQuery"]) {
    const page = Number(query.page) || PAGINATION_DEFAULTS.PAGE;
    const limit = Math.min(
      Number(query.limit) || PAGINATION_DEFAULTS.LIMIT,
      PAGINATION_DEFAULTS.MAX_LIMIT
    );
    const skip = (page - 1) * limit;

    const where: Record<string, unknown> = {};
    if (query.baseCategory) where.baseCategory = query.baseCategory;
    if (query.fabric) where.fashionAttributes = { fabric: query.fabric };
    if (query.fitType) where.fashionAttributes = { ...(where.fashionAttributes as object), fitType: query.fitType };
    if (query.occasion) where.occasions = { some: { occasion: { slug: query.occasion } } };
    
    // Support both collectionId and collectionSlug for better SEO
    // When selecting a parent collection, also include products from child collections
    if (query.collectionSlug) {
      const collection = await prisma.collection.findUnique({
        where: { slug: query.collectionSlug },
        select: { id: true, children: { select: { id: true } } },
      });
      if (collection) {
        // Get all collection IDs (parent + children)
        const collectionIds = [collection.id, ...collection.children.map((c) => c.id)];
        where.collectionId = { in: collectionIds };
      }
    } else if (query.collectionId) {
      // Fetch children for this collection too
      const collection = await prisma.collection.findUnique({
        where: { id: query.collectionId },
        select: { id: true, children: { select: { id: true } } },
      });
      if (collection) {
        const collectionIds = [collection.id, ...collection.children.map((c) => c.id)];
        where.collectionId = { in: collectionIds };
      } else {
        where.collectionId = query.collectionId;
      }
    }
    if (query.isActive !== undefined) where.isActive = query.isActive === "true";
    if (query.isFeatured !== undefined) where.isFeatured = query.isFeatured === "true";
    if (query.search) {
      where.OR = [
        { nameEn: { contains: query.search, mode: "insensitive" } },
        { nameAr: { contains: query.search, mode: "insensitive" } },
        { descriptionEn: { contains: query.search, mode: "insensitive" } },
        { descriptionAr: { contains: query.search, mode: "insensitive" } },
      ];
    }

    const filterConditions: any[] = [];

    if (query.minPrice || query.maxPrice) {
      filterConditions.push({
        variants: {
          some: {
            price: {
              ...(query.minPrice ? { gte: Number(query.minPrice) } : {}),
              ...(query.maxPrice ? { lte: Number(query.maxPrice) } : {}),
            },
          },
        },
      });
    }

    if (query.availability === "inStock") {
      filterConditions.push({
        variants: {
          some: { stock: { gt: 0 } },
        },
      });
    } else if (query.availability === "outOfStock") {
      filterConditions.push({
        variants: {
          every: { stock: 0 },
        },
      });
    }

    if (filterConditions.length > 0) {
      where.AND = filterConditions;
    }

    const isPriceSorting = query.sortBy === "price";
    const orderBy: any[] = [];
    
    if (!isPriceSorting) {
      if (query.sortBy) {
        orderBy.push({ [query.sortBy]: query.sortOrder || "desc" });
      } else {
        // Default sort: position ASC, then createdAt DESC
        orderBy.push({ position: "asc" });
        orderBy.push({ createdAt: "desc" });
      }
    }

    const [products, total] = await Promise.all([
      prisma.product.findMany({
        where,
        include: PRODUCT_INCLUDE,
        skip: isPriceSorting ? 0 : skip,
        take: isPriceSorting ? undefined : limit,
        orderBy: isPriceSorting ? undefined : orderBy,
      }),
      prisma.product.count({ where }),
    ]);

    let transformedProducts = products.map(transformProduct);

    // Handle price sorting in JavaScript since Prisma can't sort by nested variant price
    if (isPriceSorting) {
      transformedProducts.sort((a, b) => {
        const priceA = a.variants?.[0]?.price ?? 0;
        const priceB = b.variants?.[0]?.price ?? 0;
        return query.sortOrder === "asc" ? priceA - priceB : priceB - priceA;
      });
      // Apply pagination after sorting
      transformedProducts = transformedProducts.slice(skip, skip + limit);
    }

    return {
      data: transformedProducts,
      meta: { total, page, limit, totalPages: Math.ceil(total / limit) },
    };
  }

  static async getBySlug(slug: string) {
    const product = await prisma.product.findUnique({
      where: { slug },
      include: PRODUCT_INCLUDE,
    });
    return transformProduct(product);
  }

  static async getById(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: PRODUCT_INCLUDE,
    });
    return transformProduct(product);
  }

  static async create(body: ProductModel["createBody"]) {
    const slug = slugify(body.nameEn);

    const existingSlug = await prisma.product.findUnique({ where: { slug } });
    const finalSlug = existingSlug ? `${slug}-${Date.now()}` : slug;

    const { variants, options, customFields, fashionAttributes, occasionIds, occasionPositions, ...productData } = body;

    // Activation validation: active products require complete fashion attributes and at least one occasion
    if (productData.isActive) {
      const missingFields: string[] = [];
      if (!fashionAttributes) {
        missingFields.push("fashionAttributes (required: fabric, sleeveStyle, fitType, transparencyLayer)");
      } else {
        if (!fashionAttributes.fabric) missingFields.push("fashionAttributes.fabric");
        if (!fashionAttributes.sleeveStyle) missingFields.push("fashionAttributes.sleeveStyle");
        if (!fashionAttributes.fitType) missingFields.push("fashionAttributes.fitType");
        if (!fashionAttributes.transparencyLayer) missingFields.push("fashionAttributes.transparencyLayer");
      }
      if (!occasionIds || occasionIds.length === 0) {
        missingFields.push("occasionIds (at least 1 occasion required)");
      }
      if (missingFields.length > 0) {
        return { ok: false as const, error: `Cannot activate product. Missing: ${missingFields.join(", ")}`, status: 400 };
      }
    }

    const product = await prisma.product.create({
      data: {
        ...productData,
        slug: finalSlug,
        options: options
          ? {
              create: options.map((opt) => ({
                nameEn: opt.nameEn,
                nameAr: opt.nameAr,
                position: opt.position ?? 0,
                values: {
                  create: opt.values.map((v) => ({
                    valueEn: v.valueEn,
                    valueAr: v.valueAr,
                    hex: v.hex,
                    position: v.position ?? 0,
                  })),
                },
              })),
            }
          : undefined,
        customFields: customFields
          ? {
              create: customFields.map((field) => ({
                ...field,
              })),
            }
          : undefined,
        fashionAttributes: fashionAttributes
          ? {
              create: {
                fabric: fashionAttributes.fabric as any,
                embellishment: (fashionAttributes.embellishment as any) ?? 'NONE',
                sleeveStyle: fashionAttributes.sleeveStyle as any,
                fitType: fashionAttributes.fitType as any,
                transparencyLayer: fashionAttributes.transparencyLayer as any,
                neckline: fashionAttributes.neckline as any,
                length: fashionAttributes.length as any,
              },
            }
          : undefined,
        occasions: occasionIds
          ? {
              create: occasionIds.map((id: string, i: number) => ({
                occasionId: id,
                position: (occasionPositions as Record<string, number>)?.[id] ?? i,
              })),
            }
          : undefined,
        variants: variants
          ? {
              create: variants.map((v) => {
                const { optionValueIds, fitAdjustment, ...variantData } = v;
                return {
                  ...variantData,
                  fitAdjustment: fitAdjustment as any,
                  slug: slugify(`${body.nameEn}-${v.nameEn}-${Date.now()}`),
                  stock: v.stock ?? 0,
                  optionValues: optionValueIds
                    ? {
                        connect: optionValueIds.map((id) => ({ id })),
                      }
                    : undefined,
                };
              }),
            }
          : undefined,
      },
      include: PRODUCT_INCLUDE,
    });

    // Auto-link variants to option values based on their names
    if (options && options.length > 0 && product.variants.length > 0) {
      const allOptionValues = await prisma.productOptionValue.findMany({
        where: { option: { productId: product.id } },
      });

      for (const variant of product.variants) {
        // Skip if optionValues were already connected via explicit IDs
        if (variant.optionValues && variant.optionValues.length > 0) {
          continue;
        }

        const variantPartsEn = variant.nameEn.split(" / ").map(p => p.trim());
        const matchingValues = allOptionValues.filter(ov => 
          variantPartsEn.includes(ov.valueEn.trim())
        );

        if (matchingValues.length > 0) {
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: {
              optionValues: {
                connect: matchingValues.map(v => ({ id: v.id }))
              }
            }
          });
        }
      }
    }

    const finalProduct = await prisma.product.findUnique({
      where: { id: product.id },
      include: PRODUCT_INCLUDE,
    });

    return { ok: true as const, data: transformProduct(finalProduct) };
  }

  static async update(id: string, body: ProductModel["updateBody"]) {
    const existing = await prisma.product.findUnique({
      where: { id },
      include: { fashionAttributes: true, occasions: true },
    });
    if (!existing) return null;

    const { fashionAttributes, occasionIds, occasionPositions, options, customFields, ...restBody } = body;
    const updateData: Record<string, unknown> = { ...restBody };
    if (body.nameEn) {
      updateData.slug = slugify(body.nameEn);
    }

    // Activation validation: if trying to activate, require complete fashion attributes and at least one occasion
    const willBeActive = restBody.isActive === true || (restBody.isActive === undefined && existing.isActive);
    if (willBeActive) {
      const missingFields: string[] = [];
      const attrs = fashionAttributes ?? existing.fashionAttributes;
      if (!attrs) {
        missingFields.push("fashionAttributes (required: fabric, sleeveStyle, fitType, transparencyLayer)");
      } else {
        const a = attrs as any;
        if (!a.fabric) missingFields.push("fashionAttributes.fabric");
        if (!a.sleeveStyle) missingFields.push("fashionAttributes.sleeveStyle");
        if (!a.fitType) missingFields.push("fashionAttributes.fitType");
        if (!a.transparencyLayer) missingFields.push("fashionAttributes.transparencyLayer");
      }
      const hasOccasions = occasionIds ? occasionIds.length > 0 : existing.occasions.length > 0;
      if (!hasOccasions) {
        missingFields.push("occasionIds (at least 1 occasion required)");
      }
      if (missingFields.length > 0) {
        return { ok: false as const, error: `Cannot activate product. Missing: ${missingFields.join(", ")}`, status: 400 };
      }
    }

    // Update fashionAttributes if provided
    if (fashionAttributes) {
      const existingAttrs = await prisma.fashionAttributes.findUnique({ where: { productId: id } });
      if (existingAttrs) {
        await prisma.fashionAttributes.update({
          where: { productId: id },
          data: {
            fabric: fashionAttributes.fabric as any,
            embellishment: (fashionAttributes.embellishment as any) ?? 'NONE',
            sleeveStyle: fashionAttributes.sleeveStyle as any,
            fitType: fashionAttributes.fitType as any,
            transparencyLayer: fashionAttributes.transparencyLayer as any,
            neckline: fashionAttributes.neckline as any,
            length: fashionAttributes.length as any,
          },
        });
      } else {
        await prisma.fashionAttributes.create({
          data: {
            productId: id,
            fabric: fashionAttributes.fabric as any,
            embellishment: (fashionAttributes.embellishment as any) ?? 'NONE',
            sleeveStyle: fashionAttributes.sleeveStyle as any,
            fitType: fashionAttributes.fitType as any,
            transparencyLayer: fashionAttributes.transparencyLayer as any,
            neckline: fashionAttributes.neckline as any,
            length: fashionAttributes.length as any,
          },
        });
      }
    }

    // Update occasions if provided
    if (occasionIds) {
      await prisma.productOccasion.deleteMany({ where: { productId: id } });
      await prisma.productOccasion.createMany({
        data: occasionIds.map((oid: string, i: number) => ({
          productId: id,
          occasionId: oid,
          position: (occasionPositions as Record<string, number>)?.[oid] ?? i,
        })),
      });
    }

    // Update options if provided - need to delete existing and create new
    if (options) {
      // Delete existing option values first (cascade will handle this, but we need to delete options)
      await prisma.productOption.deleteMany({ where: { productId: id } });
      // Create new options with values
      if (options.length > 0) {
        await prisma.productOption.createMany({
          data: options.map((opt) => ({
            productId: id,
            nameEn: opt.nameEn,
            nameAr: opt.nameAr,
            position: opt.position ?? 0,
          })),
        });
        // Now create option values for each option
        const createdOptions = await prisma.productOption.findMany({
          where: { productId: id },
          orderBy: { position: 'asc' },
        });
        for (let i = 0; i < options.length; i++) {
          const opt = options[i];
          const createdOpt = createdOptions[i];
          if (opt.values && opt.values.length > 0) {
            await prisma.productOptionValue.createMany({
              data: opt.values.map((v) => ({
                optionId: createdOpt.id,
                valueEn: v.valueEn,
                valueAr: v.valueAr,
                hex: v.hex,
                position: v.position ?? 0,
              })),
            });
          }
        }
      }
    }

    // Update customFields if provided
    if (customFields !== undefined) {
      await prisma.productCustomField.deleteMany({ where: { productId: id } });
      if (customFields.length > 0) {
        await prisma.productCustomField.createMany({
          data: customFields.map((field) => ({
            productId: id,
            ...field,
          })),
        });
      }
    }

    const product = await prisma.product.update({
      where: { id },
      data: updateData,
      include: PRODUCT_INCLUDE,
    });

    // Auto-link variants to option values based on their names
    // For a variant named "Tomato / Small 52", it should link to "Tomato" and "Small 52" option values
    if (options && options.length > 0 && product.variants.length > 0) {
      // Get all option values for this product
      const allOptionValues = await prisma.productOptionValue.findMany({
        where: { option: { productId: id } },
      });

      for (const variant of product.variants) {
        // Split variant name by " / " to get individual option value names
        const variantPartsEn = variant.nameEn.split(" / ").map(p => p.trim());
        
        // Find matching option values for this variant
        const matchingValues = allOptionValues.filter(ov => 
          variantPartsEn.includes(ov.valueEn.trim())
        );

        if (matchingValues.length > 0) {
          // Connect the matching option values to the variant
          await prisma.productVariant.update({
            where: { id: variant.id },
            data: {
              optionValues: {
                set: matchingValues.map(v => ({ id: v.id }))
              }
            }
          });
        }
      }
    }

    // Return the updated product with the new variant links
    const finalProduct = await prisma.product.findUnique({
      where: { id },
      include: PRODUCT_INCLUDE,
    });

    return { ok: true as const, data: transformProduct(finalProduct) };
  }

  static async delete(id: string) {
    const product = await prisma.product.findUnique({
      where: { id },
      include: {
        images: true, // Product-level images
      },
    });
    if (!product) return null;

    // Collect all Cloudinary public IDs from product images
    const publicIds = [
      ...product.images.map((img) => img.publicId),
    ];

    // Delete from Cloudinary
    if (publicIds.length > 0) {
      await CloudinaryService.deleteMultiple(publicIds);
    }

    // Cascade delete will handle ProductImage, ProductVariantImage, and ProductVariant
    await prisma.product.delete({ where: { id } });
    return true;
  }

  // Variant CRUD
  static async createVariant(productId: string, body: ProductModel["createVariantBody"]) {
    const product = await prisma.product.findUnique({ where: { id: productId } });
    if (!product) return null;

    const slug = slugify(`${product.nameEn}-${body.nameEn}-${Date.now()}`);

    return prisma.productVariant.create({
      data: {
        ...body,
        slug,
        stock: body.stock ?? 0,
        productId,
      },
      include: { images: { orderBy: { position: "asc" } } },
    });
  }

  static async updateVariant(variantId: string, body: ProductModel["updateVariantBody"]) {
    const existing = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { product: true },
    });
    if (!existing) return null;

    const updateData: Record<string, unknown> = { ...body };
    if (body.nameEn) {
      updateData.slug = slugify(`${existing.product.nameEn}-${body.nameEn}-${Date.now()}`);
    }

    return prisma.productVariant.update({
      where: { id: variantId },
      data: updateData,
      include: { images: { orderBy: { position: "asc" } } },
    });
  }

  static async deleteVariant(variantId: string) {
    const variant = await prisma.productVariant.findUnique({
      where: { id: variantId },
      include: { images: { include: { image: true } } },
    });
    if (!variant) return null;

    // Delete the variant (cascade will remove ProductVariantImage links)
    await prisma.productVariant.delete({ where: { id: variantId } });

    // Check if any images are now orphaned (not linked to any other variant)
    for (const link of variant.images) {
      const otherLinks = await prisma.productVariantImage.count({
        where: { imageId: link.imageId },
      });
      if (otherLinks === 0) {
        // No other variants use this image, delete from Cloudinary
        await CloudinaryService.delete(link.image.publicId);
        await prisma.productImage.delete({ where: { id: link.imageId } });
      }
    }

    return true;
  }

  /**
   * Get related products based on collection IDs
   * Fetches products from the same collections, excluding specified product IDs
   * Falls back to featured products if not enough related products found
   */
  static async getRelatedProducts(options: {
    collectionIds: string[];
    excludeProductIds: string[];
    limit?: number;
  }) {
    const { collectionIds, excludeProductIds, limit = 4 } = options;

    let products: any[] = [];

    if (collectionIds.length > 0) {
      // Get all collection IDs including parent collections
      const collections = await prisma.collection.findMany({
        where: { id: { in: collectionIds } },
        select: { id: true, parentId: true },
      });

      // Collect all relevant collection IDs (original + parents)
      const allCollectionIds = new Set<string>(collectionIds);
      for (const col of collections) {
        if (col.parentId) {
          allCollectionIds.add(col.parentId);
        }
      }

      // Fetch products from these collections
      const relatedProducts = await prisma.product.findMany({
        where: {
          collectionId: { in: Array.from(allCollectionIds) },
          id: { notIn: excludeProductIds },
          isActive: true,
        },
        include: PRODUCT_INCLUDE,
        take: limit * 2, // Fetch more to have options after filtering
        orderBy: { createdAt: "desc" },
      });

      products = relatedProducts.map(transformProduct);
    }

    // If not enough products, fill with featured products
    if (products.length < limit) {
      const existingIds = [...excludeProductIds, ...products.map((p) => p.id)];
      const featuredProducts = await prisma.product.findMany({
        where: {
          id: { notIn: existingIds },
          isActive: true,
          isFeatured: true,
        },
        include: PRODUCT_INCLUDE,
        take: limit - products.length,
        orderBy: { createdAt: "desc" },
      });

      products = [...products, ...featuredProducts.map(transformProduct)];
    }

    // If still not enough, get any active products
    if (products.length < limit) {
      const existingIds = [...excludeProductIds, ...products.map((p) => p.id)];
      const anyProducts = await prisma.product.findMany({
        where: {
          id: { notIn: existingIds },
          isActive: true,
        },
        include: PRODUCT_INCLUDE,
        take: limit - products.length,
        orderBy: { createdAt: "desc" },
      });

      products = [...products, ...anyProducts.map(transformProduct)];
    }

    return products.slice(0, limit);
  }

  static async reorder(items: { id: string; position: number }[]) {
    await prisma.$transaction(
      items.map((item) =>
        prisma.product.update({
          where: { id: item.id },
          data: { position: item.position },
        })
      )
    );
    return true;
  }
}
