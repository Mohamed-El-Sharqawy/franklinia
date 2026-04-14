import { t, type UnwrapSchema } from "elysia";

export const OccasionModel = {
  createBody: t.Object({
    slug: t.String({ minLength: 1 }),
    nameEn: t.String({ minLength: 1 }),
    nameAr: t.String({ minLength: 1 }),
    descriptionEn: t.Optional(t.String()),
    descriptionAr: t.Optional(t.String()),
    isActive: t.Optional(t.Boolean()),
    position: t.Optional(t.Number({ minimum: 0 })),
  }),
  updateBody: t.Object({
    slug: t.Optional(t.String({ minLength: 1 })),
    nameEn: t.Optional(t.String({ minLength: 1 })),
    nameAr: t.Optional(t.String({ minLength: 1 })),
    descriptionEn: t.Optional(t.Union([t.String(), t.Null()])),
    descriptionAr: t.Optional(t.Union([t.String(), t.Null()])),
    isActive: t.Optional(t.Boolean()),
    position: t.Optional(t.Number({ minimum: 0 })),
  }),
  occasionParams: t.Object({
    id: t.String(),
  }),
  listQuery: t.Object({
    isActive: t.Optional(t.String()),
  }),
} as const;

export type OccasionModel = {
  [K in keyof typeof OccasionModel]: UnwrapSchema<(typeof OccasionModel)[K]>;
};
