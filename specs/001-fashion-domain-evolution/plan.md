# Implementation Plan: Fashion Domain Evolution

**Branch**: `001-fashion-domain-evolution` | **Date**: 2026-04-14 | **Spec**: [spec.md](./spec.md)
**Input**: Feature specification from `/specs/001-fashion-domain-evolution/spec.md`

## Summary

Evolve the monorepo from a jewellery e-commerce system into a modest fashion platform (abaya/modest dress) with structured fashion attributes, occasion-driven filtering, and collection-based browsing. Core changes: introduce FashionAttributes entity (1:1 with Product), Occasion entity (N:N with Product via ProductOccasion), baseCategory enum (ABAYA/MODEST_DRESS), fitAdjustment on ProductVariant, and remove jewellery-specific entities (Material, Stone, Clarity) and Gender enum. Marketing app gains fashion-aware filtering (fabric, occasion, fit type) on collection pages. CMS gains structured fashion attribute inputs, occasion multi-select, and baseCategory picker.

## Technical Context

**Language/Version**: TypeScript 5.x (strict mode)
**Primary Dependencies**: ElysiaJS (backend), Next.js 15 (marketing), React + Vite (CMS), Prisma 7 (ORM), Zod (validation), React Query (CMS data fetching)
**Storage**: PostgreSQL (Neon) via Prisma 7
**Testing**: Vitest (unit/integration), Playwright (e2e — marketing)
**Target Platform**: Web (Vercel for marketing, Vite dev server for CMS, Bun for backend)
**Project Type**: Monorepo e-commerce platform (3 apps + 2 packages)
**Performance Goals**: Collection filter responses < 500ms; product page LCP < 2s
**Constraints**: AED-only currency; AR/EN bilingual; Stripe standard only; Cloudinary-only media; no inter-app imports
**Scale/Scope**: ~50-200 products, 2 base categories, 5 occasions, 10 fabric types, 6 sleeve styles

## Constitution Check

*GATE: Must pass before Phase 0 research. Re-check after Phase 1 design.*

- [x] **I. Architectural Purity**: No direct inter-app imports; shared logic in `packages/`. Fashion attribute enums and Zod schemas will be defined in `packages/shared-types/`. Validation helpers in `packages/shared-utils/`.
- [x] **II. Sub-System Consistency**: Backend modules follow `src/modules/[feature]`; frontend parity maintained; shared UI components extracted. New `fashion-attributes` and `occasion` backend modules. CMS and marketing apps consume same shared types.
- [x] **III. Modest Fashion Domain Protocols**: AED currency only; AR/EN translations provided; Stripe standard only (no Connect); base categories constrained (Abaya/Modest Dress only — jalabiyas under Modest Dress); fashion attributes are mandatory structured data; occasions are first-class entity.
- [x] **IV. Fashion-First Data Architecture**: FashionAttributes entity exists as separate table (1:1 with Product); Product-Occasion N:N via ProductOccasion join entity; Collections retain existing model (filter configs future enhancement); Variants include fitAdjustment; narrative separated from structured attributes.
- [x] **V. Occasion-Driven Discovery**: Occasion entity with slug; occasion as primary filter dimension within collection pages (no dedicated routes per Q3 clarification); browsing prioritizes style/occasion/fabric over SKU.
- [x] **VI. Media & Search**: Cloudinary for all media assets (unchanged); fashion-aware search (fabric, occasion, style, silhouette) to be supported via extended search endpoints.
- [x] **VII. Structural Cleanliness**: Cross-app types/utils extracted to packages; no duplicated business logic. Fashion enums, Zod schemas, and validation in shared-types/shared-utils.

**No violations detected.** All principles satisfied by the planned design.

## Project Structure

### Documentation (this feature)

```text
specs/001-fashion-domain-evolution/
├── plan.md              # This file
├── spec.md              # Feature specification
├── research.md          # Phase 0 output
├── data-model.md        # Phase 1 output
├── quickstart.md        # Phase 1 output
├── contracts/           # Phase 1 output
│   └── fashion-api.md   # Backend API contracts for fashion endpoints
└── checklists/
    └── requirements.md  # Spec quality checklist
```

### Source Code (repository root)

```text
apps/
├── backend/
│   ├── src/
│   │   ├── modules/
│   │   │   ├── fashion-attributes/    # NEW: FashionAttributes CRUD + validation
│   │   │   │   ├── routes.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── schema.ts         # Zod validation schemas
│   │   │   ├── occasions/            # NEW: Occasion CRUD + filtering
│   │   │   │   ├── routes.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── schema.ts
│   │   │   ├── products/             # MODIFIED: Add fashion attrs, occasions, baseCategory
│   │   │   │   ├── routes.ts
│   │   │   │   ├── service.ts
│   │   │   │   └── schema.ts
│   │   │   └── collections/          # MODIFIED: Add fashion-aware filtering
│   │   │       ├── routes.ts
│   │   │       ├── service.ts
│   │   │       └── schema.ts
│   │   └── ...
│   └── prisma/
│       └── schema/                   # MODIFIED: New + removed models
│           ├── fashion-attributes.prisma  # NEW
│           ├── occasion.prisma            # NEW
│           ├── product.prisma             # MODIFIED
│           ├── attribute.prisma           # MODIFIED (Material/Stone/Clarity removed)
│           └── ...
├── marketing/
│   └── src/
│       ├── app/[locale]/
│       │   ├── collections/[slug]/   # MODIFIED: Add fashion filters
│       │   └── products/[slug]/      # MODIFIED: Display fashion attrs + occasions
│       ├── components/
│       │   ├── fashion-attributes/    # NEW: Fashion attribute display components
│       │   └── occasion/             # NEW: Occasion badge + filter components
│       └── lib/
│           └── api.ts                 # MODIFIED: Fashion-aware API calls
└── cms/
    └── src/
        ├── features/
        │   ├── products/
        │   │   ├── components/
        │   │   │   ├── FashionAttributesForm.tsx  # NEW
        │   │   │   ├── OccasionSelector.tsx       # NEW
        │   │   │   ├── BaseCategorySelect.tsx     # NEW
        │   │   │   ├── VariantMatrix.tsx          # MODIFIED: Add fitAdjustment
        │   │   │   └── ...
        │   │   ├── mutations.ts       # MODIFIED: Include fashion attrs + occasions
        │   │   └── api.ts             # MODIFIED: Fashion-aware API hooks
        │   └── occasions/             # NEW: Occasion management
        │       ├── components/
        │       ├── mutations.ts
        │       └── api.ts
        └── pages/
            ├── products/
            │   ├── new.tsx            # MODIFIED: Include fashion attrs form
            │   └── edit.tsx           # MODIFIED: Include fashion attrs form
            └── occasions/            # NEW: Occasion CRUD pages
                ├── list.tsx
                └── new.tsx

packages/
├── shared-types/
│   ├── fashion-enums.ts              # NEW: Fabric, Embellishment, SleeveStyle, etc. enums
│   ├── fashion-attributes.ts         # NEW: FashionAttributes interface + Zod schema
│   ├── occasion.ts                   # NEW: Occasion interface + Zod schema
│   └── product.ts                    # MODIFIED: Add baseCategory, remove Gender
└── shared-utils/
    ├── fashion-validators.ts         # NEW: Fashion attribute validation helpers
    └── fashion-labels.ts             # NEW: Localized label maps for fashion enums
```

**Structure Decision**: Monorepo (Option 4) — existing structure preserved. New modules added under backend `src/modules/`, new components under marketing/cms `src/`, and shared types/utils extracted to `packages/`.

## Complexity Tracking

| Violation | Why Needed | Simpler Alternative Rejected Because |
|-----------|------------|-------------------------------------|
| Principle V: "Occasion Landing Pages" vs filter-only | User clarification (Q3) chose to follow byfatimaa.com pattern — no dedicated occasion routes, occasions as filter dimension within collections | Dedicated occasion routes would add route surface, page components, and SEO management without matching the reference site's UX. Occasion filtering within collections satisfies the spirit of "first-class merchandising surfaces, not tag-filtered afterthoughts" — occasion is a primary filter equal to price and category. Constitution amendment recommended to align wording with clarification. |

## Post-Design Constitution Re-Check

- [x] **I. Architectural Purity**: Fashion enums in `packages/shared-types/`, validators/labels in `packages/shared-utils/`. No inter-app imports. ✓
- [x] **II. Sub-System Consistency**: Backend modules (`fashion-attributes/`, `occasions/`) follow `src/modules/[feature]` pattern. CMS and marketing consume same shared types. ✓
- [x] **III. Modest Fashion Domain Protocols**: AED only, AR/EN labels in `fashion-labels.ts`, Stripe standard, base categories (ABAYA/MODEST_DRESS), fashion attributes mandatory (schema + validation), occasions as first-class entity. ✓
- [x] **IV. Fashion-First Data Architecture**: FashionAttributes as separate table (1:1 with Product), Product-Occasion N:N via ProductOccasion join entity, fitAdjustment on ProductVariant, narrative (descriptionEn/Ar) separated from structured attributes. ✓
- [x] **V. Occasion-Driven Discovery**: Occasion entity with slug, occasion as primary filter dimension within collection pages (no dedicated routes per Q3 clarification — follows byfatimaa.com). Occasion is equal-weight filter alongside price and category. Browsing prioritizes style/occasion/fabric. **Note**: Constitution wording "Occasion Landing Pages" should be amended to "Occasion-Based Collection Views" to reflect filter-within-collection pattern. ✓ (with recommended amendment)
- [x] **VI. Media & Search**: Cloudinary unchanged. Fashion-aware search supported via extended search endpoint (fabric, occasion, fitType, baseCategory query params). ✓
- [x] **VII. Structural Cleanliness**: All cross-app types in packages/. No duplicated business logic. Fashion enums, Zod schemas, and labels defined once in shared packages. ✓

**Result**: All principles pass. One recommended constitution amendment (principle V wording) to align with Q3 clarification.
