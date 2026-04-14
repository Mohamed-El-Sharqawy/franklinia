# Quickstart: Fashion Domain Evolution

**Branch**: `001-fashion-domain-evolution` | **Date**: 2026-04-14

## Prerequisites

- pnpm installed globally
- Bun runtime installed (for backend)
- Node.js 20+ (for frontend apps)
- PostgreSQL database (Neon) accessible
- Cloudinary account configured

## Initial Setup

```bash
# From repo root
pnpm install

# Ensure backend .env is configured with DATABASE_URL
# Run existing migrations
cd apps/backend
pnpm prisma migrate dev
cd ../..
```

## Implementation Order

### Step 1: Shared Types & Enums (packages/)

1. Create `packages/shared-types/fashion-enums.ts` — all fashion enum definitions (Fabric, Embellishment, SleeveStyle, Neckline, FitType, GarmentLength, TransparencyLayer, BaseCategory, FitAdjustment)
2. Create `packages/shared-types/fashion-attributes.ts` — FashionAttributes interface + Zod schema
3. Create `packages/shared-types/occasion.ts` — Occasion interface + Zod schema
4. Update `packages/shared-types/product.ts` — add baseCategory, remove Gender
5. Create `packages/shared-utils/fashion-validators.ts` — validation helpers (fashion attribute completeness check)
6. Create `packages/shared-utils/fashion-labels.ts` — localized AR/EN label maps for all fashion enums

### Step 2: Prisma Schema (backend)

1. Create `apps/backend/prisma/schema/fashion-attributes.prisma` — FashionAttributes model + all enums
2. Create `apps/backend/prisma/schema/occasion.prisma` — Occasion + ProductOccasion models
3. Modify `apps/backend/prisma/schema/product.prisma` — add baseCategory, fashionAttributes relation, occasions relation; remove materialId/stoneId/clarityId/gender
4. Modify `apps/backend/prisma/schema/attribute.prisma` — remove Material, Stone, Clarity models
5. Run `pnpm prisma migrate dev --name add-fashion-domain` (additive migration only)
6. Run `pnpm prisma migrate dev --name remove-jewellery-attributes` (destructive migration, after Step 3)

### Step 3: Backend Modules (backend)

1. Create `apps/backend/src/modules/fashion-attributes/` — routes, service, schema (Zod validation)
2. Create `apps/backend/src/modules/occasions/` — CRUD routes, service, schema
3. Modify `apps/backend/src/modules/products/` — add fashionAttributes + occasions to create/update handlers, add validation for active products
4. Modify `apps/backend/src/modules/collections/` — add fashion-aware filtering (fabric, occasion, fitType, sleeveStyle query params)

### Step 4: CMS Features (cms)

1. Create `apps/cms/src/features/occasions/` — occasion management (list, create, edit, delete)
2. Create `FashionAttributesForm.tsx` — structured dropdowns for all fashion attribute fields
3. Create `OccasionSelector.tsx` — multi-select for occasion associations with position
4. Create `BaseCategorySelect.tsx` — ABAYA/MODEST_DRESS selector
5. Modify `VariantMatrix.tsx` — add fitAdjustment field per variant
6. Modify `apps/cms/src/pages/products/new.tsx` — integrate fashion attributes form, occasion selector, base category select
7. Modify `apps/cms/src/pages/products/edit.tsx` — same integrations
8. Remove jewellery attribute inputs (material, stone, clarity) from product forms
9. Remove gender selector from product forms

### Step 5: Marketing App (marketing)

1. Create `apps/marketing/src/components/fashion-attributes/` — KeyFeatures display, attribute summary for cards
2. Create `apps/marketing/src/components/occasion/` — OccasionBadge, OccasionFilter
3. Modify `apps/marketing/src/app/[locale]/collections/[slug]/` — add fashion filters to filter drawer, update hooks
4. Modify `apps/marketing/src/app/[locale]/products/[slug]/` — display fashion attributes section, occasion badges, fit adjustment info, layering notices
5. Remove gender-based collection pages and gender filters

### Step 6: Seed Data

1. Create seed script for predefined occasions (Eid, Wedding, Evening, Casual, Daily Elegance)
2. Create seed script for sample products with complete FashionAttributes per base category

## Verification Commands

```bash
# Build all workspaces
pnpm build

# Run backend in dev mode
cd apps/backend && pnpm dev

# Run marketing in dev mode
cd apps/marketing && pnpm dev

# Run CMS in dev mode
cd apps/cms && pnpm dev

# Run Prisma studio to inspect data
cd apps/backend && pnpm prisma studio

# Validate Prisma schema
cd apps/backend && pnpm prisma validate

# Run migrations
cd apps/backend && pnpm prisma migrate dev
```

## Key Files to Watch

| File | Change Type |
|------|-------------|
| `packages/shared-types/fashion-enums.ts` | NEW |
| `packages/shared-types/fashion-attributes.ts` | NEW |
| `packages/shared-types/occasion.ts` | NEW |
| `packages/shared-utils/fashion-validators.ts` | NEW |
| `packages/shared-utils/fashion-labels.ts` | NEW |
| `apps/backend/prisma/schema/fashion-attributes.prisma` | NEW |
| `apps/backend/prisma/schema/occasion.prisma` | NEW |
| `apps/backend/prisma/schema/product.prisma` | MODIFIED |
| `apps/backend/prisma/schema/attribute.prisma` | MODIFIED |
| `apps/backend/src/modules/fashion-attributes/` | NEW |
| `apps/backend/src/modules/occasions/` | NEW |
| `apps/cms/src/features/products/components/FashionAttributesForm.tsx` | NEW |
| `apps/cms/src/features/products/components/OccasionSelector.tsx` | NEW |
| `apps/marketing/src/components/fashion-attributes/` | NEW |
| `apps/marketing/src/components/occasion/` | NEW |
