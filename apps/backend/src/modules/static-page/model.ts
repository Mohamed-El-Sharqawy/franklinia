import { t, type UnwrapSchema } from "elysia";

export const StaticPageModel = {
  // Page validation
  createPageBody: t.Object({
    slug: t.String({ minLength: 1 }),
    titleEn: t.String({ minLength: 1 }),
    titleAr: t.String({ minLength: 1 }),
    contentEn: t.String(),
    contentAr: t.String(),
    metaTitleEn: t.Optional(t.String()),
    metaTitleAr: t.Optional(t.String()),
    metaDescriptionEn: t.Optional(t.String()),
    metaDescriptionAr: t.Optional(t.String()),
    isActive: t.Optional(t.Boolean()),
    position: t.Optional(t.Number({ minimum: 0 })),
  }),
  updatePageBody: t.Partial(
    t.Object({
      slug: t.String({ minLength: 1 }),
      titleEn: t.String({ minLength: 1 }),
      titleAr: t.String({ minLength: 1 }),
      contentEn: t.String(),
      contentAr: t.String(),
      metaTitleEn: t.Optional(t.String()),
      metaTitleAr: t.Optional(t.String()),
      metaDescriptionEn: t.Optional(t.String()),
      metaDescriptionAr: t.Optional(t.String()),
      isActive: t.Boolean(),
      position: t.Number({ minimum: 0 }),
    })
  ),

  // Policy validation
  createPolicyBody: t.Object({
    slug: t.String({ minLength: 1 }),
    titleEn: t.String({ minLength: 1 }),
    titleAr: t.String({ minLength: 1 }),
    contentEn: t.String(),
    contentAr: t.String(),
    isActive: t.Optional(t.Boolean()),
  }),
  updatePolicyBody: t.Partial(
    t.Object({
      slug: t.String({ minLength: 1 }),
      titleEn: t.String({ minLength: 1 }),
      titleAr: t.String({ minLength: 1 }),
      contentEn: t.String(),
      contentAr: t.String(),
      isActive: t.Boolean(),
    })
  ),
};

export type StaticPageModel = {
  [K in keyof typeof StaticPageModel]: UnwrapSchema<(typeof StaticPageModel)[K]>;
};
