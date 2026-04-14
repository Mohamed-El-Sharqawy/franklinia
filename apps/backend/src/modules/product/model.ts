import { t, type UnwrapSchema } from "elysia";

export const ProductModel = {
  createBody: t.Object({
    nameEn: t.String({ minLength: 1 }),
    nameAr: t.String({ minLength: 1 }),
    descriptionEn: t.String(),
    descriptionAr: t.String(),
    shortDescriptionEn: t.Optional(t.String()),
    shortDescriptionAr: t.Optional(t.String()),
    metaTitleEn: t.Optional(t.String()),
    metaTitleAr: t.Optional(t.String()),
    metaDescriptionEn: t.Optional(t.String()),
    metaDescriptionAr: t.Optional(t.String()),
    baseCategory: t.Union([t.Literal("ABAYA"), t.Literal("MODEST_DRESS")]),
    collectionId: t.Optional(t.String()),
    isActive: t.Optional(t.Boolean()),
    isFeatured: t.Optional(t.Boolean()),
    badge: t.Optional(t.Union([t.Literal("NEW"), t.Literal("BESTSELLER"), t.Literal("LIMITED_EDITION"), t.Null()])),
    isTrending: t.Optional(t.Boolean()),
    position: t.Optional(t.Number({ minimum: 0 })),
    fashionAttributes: t.Optional(
      t.Object({
        fabric: t.String(),
        embellishment: t.Optional(t.String()),
        sleeveStyle: t.String(),
        fitType: t.String(),
        transparencyLayer: t.String(),
        neckline: t.Optional(t.Union([t.String(), t.Null()])),
        length: t.Optional(t.Union([t.String(), t.Null()])),
      })
    ),
    occasionIds: t.Optional(t.Array(t.String())),
    occasionPositions: t.Optional(t.Record(t.String(), t.Number())),
    options: t.Optional(
      t.Array(
        t.Object({
          nameEn: t.String(),
          nameAr: t.String(),
          position: t.Optional(t.Number()),
          values: t.Array(
            t.Object({
              valueEn: t.String(),
              valueAr: t.String(),
              hex: t.Optional(t.Union([t.String(), t.Null()])),
              position: t.Optional(t.Number()),
            })
          ),
        })
      )
    ),
    customFields: t.Optional(
      t.Array(
        t.Object({
          type: t.Union([t.Literal("TEXT"), t.Literal("TEXTAREA"), t.Literal("NUMBER"), t.Literal("FILE")]),
          labelEn: t.String(),
          labelAr: t.String(),
          placeholderEn: t.Optional(t.String()),
          placeholderAr: t.Optional(t.String()),
          isRequired: t.Optional(t.Boolean()),
        })
      )
    ),
    variants: t.Optional(
      t.Array(
        t.Object({
          nameEn: t.String({ minLength: 1 }),
          nameAr: t.String({ minLength: 1 }),
          sku: t.Optional(t.String()),
          price: t.Number({ minimum: 0 }),
          compareAtPrice: t.Optional(t.Number({ minimum: 0 })),
          stock: t.Optional(t.Number({ minimum: 0 })),
          isActive: t.Optional(t.Boolean()),
          optionValueIds: t.Optional(t.Array(t.String())),
          fitAdjustment: t.Optional(t.Union([t.Literal("LOOSE"), t.Literal("RELAXED"), t.Literal("STRUCTURED"), t.Null()])),
        })
      )
    ),
  }),
  updateBody: t.Object({
    nameEn: t.Optional(t.String({ minLength: 1 })),
    nameAr: t.Optional(t.String({ minLength: 1 })),
    descriptionEn: t.Optional(t.String()),
    descriptionAr: t.Optional(t.String()),
    shortDescriptionEn: t.Optional(t.String()),
    shortDescriptionAr: t.Optional(t.String()),
    metaTitleEn: t.Optional(t.String()),
    metaTitleAr: t.Optional(t.String()),
    metaDescriptionEn: t.Optional(t.String()),
    metaDescriptionAr: t.Optional(t.String()),
    baseCategory: t.Optional(t.Union([t.Literal("ABAYA"), t.Literal("MODEST_DRESS")])),
    collectionId: t.Optional(t.Union([t.String(), t.Null()])),
    isActive: t.Optional(t.Boolean()),
    isFeatured: t.Optional(t.Boolean()),
    badge: t.Optional(t.Union([t.Literal("NEW"), t.Literal("BESTSELLER"), t.Literal("LIMITED_EDITION"), t.Null()])),
    isTrending: t.Optional(t.Boolean()),
    position: t.Optional(t.Number({ minimum: 0 })),
    fashionAttributes: t.Optional(
      t.Object({
        fabric: t.String(),
        embellishment: t.Optional(t.String()),
        sleeveStyle: t.String(),
        fitType: t.String(),
        transparencyLayer: t.String(),
        neckline: t.Optional(t.Union([t.String(), t.Null()])),
        length: t.Optional(t.Union([t.String(), t.Null()])),
      })
    ),
    occasionIds: t.Optional(t.Array(t.String())),
    occasionPositions: t.Optional(t.Record(t.String(), t.Number())),
    defaultVariantId: t.Optional(t.Union([t.String(), t.Null()])),
    hoverVariantId: t.Optional(t.Union([t.String(), t.Null()])),
    options: t.Optional(
      t.Array(
        t.Object({
          nameEn: t.String(),
          nameAr: t.String(),
          position: t.Optional(t.Number()),
          values: t.Array(
            t.Object({
              valueEn: t.String(),
              valueAr: t.String(),
              hex: t.Optional(t.Union([t.String(), t.Null()])),
              position: t.Optional(t.Number()),
            })
          ),
        })
      )
    ),
    customFields: t.Optional(
      t.Array(
        t.Object({
          type: t.Union([t.Literal("TEXT"), t.Literal("TEXTAREA"), t.Literal("NUMBER"), t.Literal("FILE")]),
          labelEn: t.String(),
          labelAr: t.String(),
          placeholderEn: t.Optional(t.String()),
          placeholderAr: t.Optional(t.String()),
          isRequired: t.Optional(t.Boolean()),
        })
      )
    ),
  }),
  createVariantBody: t.Object({
    nameEn: t.String({ minLength: 1 }),
    nameAr: t.String({ minLength: 1 }),
    sku: t.Optional(t.String()),
    price: t.Number({ minimum: 0 }),
    compareAtPrice: t.Optional(t.Number({ minimum: 0 })),
    stock: t.Optional(t.Number({ minimum: 0 })),
    isActive: t.Optional(t.Boolean()),
    metaTitleEn: t.Optional(t.String()),
    metaTitleAr: t.Optional(t.String()),
    metaDescriptionEn: t.Optional(t.String()),
    metaDescriptionAr: t.Optional(t.String()),
  }),
  updateVariantBody: t.Object({
    nameEn: t.Optional(t.String({ minLength: 1 })),
    nameAr: t.Optional(t.String({ minLength: 1 })),
    sku: t.Optional(t.String()),
    price: t.Optional(t.Number({ minimum: 0 })),
    compareAtPrice: t.Optional(t.Number({ minimum: 0 })),
    stock: t.Optional(t.Number({ minimum: 0 })),
    isActive: t.Optional(t.Boolean()),
    metaTitleEn: t.Optional(t.String()),
    metaTitleAr: t.Optional(t.String()),
    metaDescriptionEn: t.Optional(t.String()),
    metaDescriptionAr: t.Optional(t.String()),
  }),
  listQuery: t.Object({
    page: t.Optional(t.String()),
    limit: t.Optional(t.String()),
    baseCategory: t.Optional(t.String()),
    fabric: t.Optional(t.String()),
    occasion: t.Optional(t.String()),
    fitType: t.Optional(t.String()),
    collectionId: t.Optional(t.String()),
    collectionSlug: t.Optional(t.String()),
    isActive: t.Optional(t.String()),
    isFeatured: t.Optional(t.String()),
    search: t.Optional(t.String()),
    minPrice: t.Optional(t.String()),
    maxPrice: t.Optional(t.String()),
    sortBy: t.Optional(t.String()),
    sortOrder: t.Optional(t.String()),
    availability: t.Optional(t.String()),
  }),
  relatedProductsBody: t.Object({
    collectionIds: t.Array(t.String()),
    excludeProductIds: t.Array(t.String()),
    limit: t.Optional(t.Number({ minimum: 1, maximum: 20 })),
  }),
  reorderBody: t.Object({
    items: t.Array(
      t.Object({
        id: t.String(),
        position: t.Number({ minimum: 0 }),
      })
    ),
  }),
} as const;

export type ProductModel = {
  [K in keyof typeof ProductModel]: UnwrapSchema<(typeof ProductModel)[K]>;
};
