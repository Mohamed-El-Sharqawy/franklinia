# Research: Fashion Domain Evolution

**Branch**: `001-fashion-domain-evolution` | **Date**: 2026-04-14

## Research Tasks

### R-001: Prisma 7 Enum Strategy for Fashion Attributes

**Decision**: Use Prisma native enums for all FashionAttributes fields (fabric, embellishment, sleeveStyle, neckline, fitType, length, transparencyLayer) and baseCategory/fitAdjustment.

**Rationale**: Prisma enums are schema-enforced, provide type safety at the database level, prevent invalid values at insert time, and generate TypeScript union types automatically. This aligns with the constitution requirement that fashion attributes MUST be "typed as enums or constrained sets — never free-text strings."

**Alternatives considered**:
- **String fields with Zod validation only**: Rejected — allows invalid data at the database level if validation is bypassed (e.g., direct SQL, migration scripts). Constitution requires schema-level enforcement.
- **Lookup tables (like existing Material/Stone/Clarity)**: Rejected — over-engineered for fixed enum values. Lookup tables are appropriate when values are user-managed (like collections), but fabric types and sleeve styles are domain-fixed and only change via schema migration.
- **PostgreSQL native enums via raw SQL**: Rejected — Prisma 7 supports native enums directly; no need to bypass the ORM.

### R-002: FashionAttributes 1:1 Implementation Pattern

**Decision**: Use a separate `FashionAttributes` table with a 1:1 relation to Product via `productId` as both foreign key and primary key (unique, not just indexed).

**Rationale**: Constitution principle IV explicitly states "FashionAttributes entity MUST exist as a distinct entity (1:1 with Product, either embedded or separate table)" and "Product fields that represent fashion semantics MUST NOT be stored as flat columns on the Product table." A separate table:
- Enforces the separation of narrative from structure
- Keeps the Product model clean (no 7+ new columns)
- Allows FashionAttributes to be queried independently
- Matches the existing pattern of separate tables for related data (ProductImage, CollectionImage)

**Alternatives considered**:
- **Embedded columns on Product**: Rejected — violates constitution principle IV ("No Flat Product Blobs").
- **JSON column on Product**: Rejected — unqueryable at the database level, violates constitution requirement for typed enums.
- **Prisma composite type (@relation + embedded)**: Rejected — Prisma 7 composite types don't support enums well and are less queryable.

### R-003: ProductOccasion Join Entity Design

**Decision**: Create an explicit `ProductOccasion` join table with `productId`, `occasionId`, and `position` (Int, default 0). Unique constraint on `[productId, occasionId]`.

**Rationale**: Prisma implicit N:N relations don't support additional fields on the join table. The `position` field is required per Q5 clarification to enable editorial curation of product ordering within each occasion context. An explicit join entity is the only way to add this field.

**Alternatives considered**:
- **Prisma implicit N:N (no join model)**: Rejected — cannot add `position` field.
- **Array of occasion IDs on Product**: Rejected — violates constitution ("Occasion MUST NOT be stored as a flat tag or free-text field"), not queryable at DB level.

### R-004: Migration Strategy for Jewellery Attribute Removal

**Decision**: Multi-step migration approach:
1. Add new entities (FashionAttributes, Occasion, ProductOccasion) and new fields (baseCategory, fitAdjustment) — additive, non-breaking
2. Populate FashionAttributes for existing products via a seed script (manual CMS entry for real data, but seed script for development)
3. Remove Material, Stone, Clarity entities and their FK fields from Product — destructive migration
4. Remove Gender enum and gender-related fields — destructive migration

**Rationale**: Additive changes must come first so existing data isn't orphaned. The destructive changes (removing jewellery entities) come last after the new fashion attributes are in place. This matches the spec's P6 priority ordering (jewellery removal comes after fashion attribute creation).

**Alternatives considered**:
- **Single monolithic migration**: Rejected — too risky; if any step fails, the entire migration rolls back including the additive parts that were working.
- **Data transformation (auto-populate fashion attrs from jewellery attrs)**: Rejected — no meaningful mapping exists between jewellery attributes (material=gold, stone=diamond, clarity=VS1) and fashion attributes (fabric=chiffon, sleeveStyle=cape). Manual entry via CMS is the only correct approach.

### R-005: Fashion-Aware Filtering on Collection Endpoints

**Decision**: Extend the existing collection products endpoint with additional query parameters: `fabric`, `occasion`, `fitType`, `sleeveStyle`. These join through FashionAttributes and ProductOccasion tables respectively.

**Rationale**: The existing collection endpoint already supports `priceMin`, `priceMax`, `isAvailable`, and `sort` parameters. Adding fashion filters as additional query parameters follows the same pattern and keeps the API consistent. The Prisma query will use `where` clauses with `FashionAttributes` relation filtering and `occasions` relation filtering.

**Alternatives considered**:
- **Separate fashion-filter endpoint**: Rejected — adds unnecessary API surface; the existing endpoint already handles filtering.
- **Client-side filtering after fetching all products**: Rejected — doesn't scale, violates the <500ms performance requirement.
- **GraphQL-style flexible querying**: Rejected — over-engineered for this scope; REST query parameters are sufficient.

### R-006: Shared Types Package Structure for Fashion Enums

**Decision**: Define all fashion enums as TypeScript const enums + Zod schemas in `packages/shared-types/fashion-enums.ts`. Each enum gets a TypeScript union type, a Zod native enum schema, and localized label maps in `packages/shared-utils/fashion-labels.ts`.

**Rationale**: Constitution principle VII requires cross-app types in `packages/shared-types/`. Using const enums ensures type safety at compile time. Zod schemas provide runtime validation for API inputs. Localized label maps (AR/EN) in shared-utils ensure consistent display across marketing and CMS apps.

**Alternatives considered**:
- **Enums defined separately per app**: Rejected — violates constitution principle VII (no duplication).
- **Enums in Prisma schema only (auto-generated)**: Rejected — Prisma generates types but not Zod schemas or label maps; additional shared definitions are still needed.
- **Runtime-validated string unions only (no const enums)**: Rejected — loses IDE autocomplete and compile-time safety.

## Resolved Clarifications

All NEEDS CLARIFICATION items from Technical Context have been resolved through the clarification session (see spec.md § Clarifications). No outstanding unknowns remain.
