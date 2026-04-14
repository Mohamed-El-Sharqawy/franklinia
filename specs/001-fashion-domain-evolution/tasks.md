# Tasks: Fashion Domain Evolution

**Input**: Design documents from `/specs/001-fashion-domain-evolution/`
**Prerequisites**: plan.md (required), spec.md (required), research.md, data-model.md, contracts/fashion-api.md, quickstart.md

**Tests**: Not requested — no test tasks generated.

**Organization**: Tasks are grouped by user story to enable independent implementation and testing of each story.

**LLM Execution Note**: Each task is self-contained with exact file paths, enum values, field definitions, and code patterns from the existing codebase. Reference `specs/001-fashion-domain-evolution/data-model.md` for full Prisma model definitions and `specs/001-fashion-domain-evolution/contracts/fashion-api.md` for API shapes.

## Format: `[ID] [P?] [Story] Description`

- **[P]**: Can run in parallel (different files, no dependencies)
- **[Story]**: Which user story this task belongs to (e.g., US1, US2, US3)
- Include exact file paths in descriptions

---

## Phase 1: Setup (Shared Infrastructure)

**Purpose**: Create shared fashion enums, types, and utilities in `packages/` that all apps will consume. No app-level changes yet.

- [ ] T001 [P] Create fashion enum definitions in `packages/shared-types/src/fashion-enums.ts`. Define the following TypeScript enums (matching Prisma enum names exactly): `BaseCategory` (ABAYA, MODEST_DRESS), `FitAdjustment` (LOOSE, RELAXED, STRUCTURED), `Fabric` (CHIFFON, CREPE, SATIN, LACE, JERSEY, NIDHA, LINEN, VELVET, ORGANZA, GEORGETTE), `Embellishment` (EMBROIDERY, BEADS, LACE_OVERLAY, CRYSTAL, SEQUINS, NONE), `SleeveStyle` (CAPE, KIMONO, FLARED, FITTED, BELL, BATWING), `Neckline` (ROUND, V_NECK, BOAT, STAND_COLLAR, HOODED, OPEN_FRONT), `FitType` (FLOWY, RELAXED, STRUCTURED, A_LINE), `GarmentLength` (FULL_LENGTH, MIDI, KNEE_LENGTH), `TransparencyLayer` (INNER, OUTER, CLOSED). Each enum must use `= "VALUE"` string assignment pattern (e.g., `CHIFFON = "CHIFFON"`). Export all enums.

- [ ] T002 [P] Create FashionAttributes interface and Zod schema in `packages/shared-types/src/fashion-attributes.ts`. Import enums from `./fashion-enums`. Define `FashionAttributes` interface with fields: `id: string`, `productId: string`, `fabric: Fabric` (required), `embellishment: Embellishment` (required, defaults NONE), `sleeveStyle: SleeveStyle` (required), `fitType: FitType` (required), `transparencyLayer: TransparencyLayer` (required), `neckline: Neckline | null` (optional), `length: GarmentLength | null` (optional), `createdAt: Date`, `updatedAt: Date`. Also create a `CreateFashionAttributesInput` type omitting id/productId/timestamps. Export both.

- [ ] T003 [P] Create Occasion interface in `packages/shared-types/src/occasion.ts`. Define `Occasion` interface: `id: string`, `slug: string`, `nameEn: string`, `nameAr: string`, `descriptionEn: string | null`, `descriptionAr: string | null`, `isActive: boolean`, `position: number`, `createdAt: Date`, `updatedAt: Date`. Also define `ProductOccasion` interface: `id: string`, `productId: string`, `occasionId: string`, `position: number`, `occasion?: Occasion`, `createdAt: Date`. Also define `CreateOccasionInput` (slug, nameEn, nameAr, descriptionEn?, descriptionAr?, isActive?, position?) and `UpdateOccasionInput` as `Partial<CreateOccasionInput>`. Export all.

- [ ] T004 [P] Create localized label maps for fashion enums in `packages/shared-utils/src/fashion-labels.ts`. For each fashion enum (Fabric, Embellishment, SleeveStyle, Neckline, FitType, GarmentLength, TransparencyLayer, BaseCategory, FitAdjustment), create a `Record<EnumValue, { en: string; ar: string }>` map. Example: `fabricLabels: Record<Fabric, { en: string; ar: string }> = { CHIFFON: { en: "Chiffon", ar: "شيفون" }, CREPE: { en: "Crepe", ar: "كريب" }, ... }`. Import enums from `@ecommerce/shared-types`. Export all label maps.

- [ ] T005 [P] Create fashion validation helpers in `packages/shared-utils/src/fashion-validators.ts`. Import enums from `@ecommerce/shared-types`. Create: (1) `isCompleteFashionAttributes(attrs: Partial<FashionAttributes>): boolean` — returns true if fabric, sleeveStyle, fitType, transparencyLayer, and embellishment are all non-null; (2) `getMissingRequiredFields(attrs: Partial<FashionAttributes>): string[]` — returns list of missing required field names; (3) `isValidForActivation(product: { fashionAttributes?: any; occasions?: any[] }): { valid: boolean; errors: string[] }` — checks fashionAttributes completeness AND at least 1 occasion. Export all.

- [ ] T006 Update `packages/shared-types/src/product.ts` to add fashion domain types and remove jewellery types. Specifically: (1) Remove the `Gender` enum (lines 3-7). (2) Remove `Material`, `Clarity`, `Stone` interfaces. (3) Import `BaseCategory`, `FashionAttributes`, `ProductOccasion` from `./fashion-enums`, `./fashion-attributes`, `./occasion`. (4) Add to `Product` interface: `baseCategory: BaseCategory`, `fashionAttributes?: FashionAttributes | null`, `occasions?: ProductOccasion[]`. (5) Remove from `Product` interface: `gender: Gender`, `materialId`, `stoneId`, `clarityId`, `material`, `stone`, `clarity`. (6) Add `fitAdjustment?: FitAdjustment | null` to `ProductVariant` interface (import `FitAdjustment` from `./fashion-enums`). (7) Update `ProductFilters` interface: remove `gender?: Gender`, add `fabric?: Fabric`, `occasion?: string`, `fitType?: FitType`, `baseCategory?: BaseCategory`.

- [ ] T007 Update barrel export in `packages/shared-types/src/index.ts`. Add two new lines: `export * from "./fashion-enums";`, `export * from "./fashion-attributes";`, `export * from "./occasion";`. Keep all existing exports.

- [ ] T008 Update barrel export in `packages/shared-utils/src/index.ts`. Add two new lines: `export * from "./fashion-labels";`, `export * from "./fashion-validators";`. Keep all existing exports.

**Checkpoint**: Shared packages complete. Run `pnpm build` from repo root to verify types compile.

---

## Phase 2: Foundational (Prisma Schema + Seed Data)

**Purpose**: Create new database entities, modify Product/ProductVariant schemas, and run migrations. This MUST be complete before any user story work.

**⚠️ CRITICAL**: No user story work can begin until this phase is complete.

- [ ] T009 Create Prisma schema file `apps/backend/prisma/schema/fashion-attributes.prisma`. Copy the exact model definitions from `specs/001-fashion-domain-evolution/data-model.md` § "Enum Definitions" and § "FashionAttributes". This file must define all 9 enums (BaseCategory, FitAdjustment, Fabric, Embellishment, SleeveStyle, Neckline, FitType, GarmentLength, TransparencyLayer) and the FashionAttributes model with: `id String @id @default(cuid())`, `productId String @unique`, `product Product @relation(...)`, required fields (fabric Fabric, embellishment Embellishment @default(NONE), sleeveStyle SleeveStyle, fitType FitType, transparencyLayer TransparencyLayer), optional fields (neckline Neckline?, length GarmentLength?), timestamps, and indexes on fabric/sleeveStyle/fitType/transparencyLayer. Use `@@map("fashion_attributes")`.

- [ ] T010 Create Prisma schema file `apps/backend/prisma/schema/occasion.prisma`. Define the Occasion model with: `id String @id @default(cuid())`, `slug String @unique`, `nameEn String`, `nameAr String`, `descriptionEn String? @db.Text`, `descriptionAr String? @db.Text`, `isActive Boolean @default(true)`, `position Int @default(0)`, `products ProductOccasion[]`, timestamps, indexes on slug/isActive/position, `@@map("occasions")`. Also define the ProductOccasion model with: `id String @id @default(cuid())`, `productId String`, `occasionId String`, `position Int @default(0)`, relations to Product (onDelete: Cascade) and Occasion (onDelete: Cascade), `@@unique([productId, occasionId])`, indexes on productId/occasionId/position, `@@map("product_occasions")`.

- [ ] T011 Modify `apps/backend/prisma/schema/product.prisma`. Make these changes: (1) Remove the `Gender` enum definition (MEN/WOMEN/UNISEX). (2) On the Product model: remove `gender Gender` field, remove `materialId String?` and its `material Material? @relation(...)`, remove `stoneId String?` and its `stone Stone? @relation(...)`, remove `clarityId String?` and its `clarity Clarity? @relation(...)`. (3) Add to Product model: `baseCategory BaseCategory` (required, no default), `fashionAttributes FashionAttributes?` (relation), `occasions ProductOccasion[]` (relation). (4) Add `@@index([baseCategory])` to Product model. (5) On ProductVariant model: add `fitAdjustment FitAdjustment?` (optional). Note: BaseCategory and FitAdjustment enums are defined in fashion-attributes.prisma.

- [ ] T012 Modify `apps/backend/prisma/schema/attribute.prisma`. Remove the three jewellery-specific models entirely: `Material` model (with all its fields, relations, and indexes), `Stone` model (with all its fields, relations, and indexes), `Clarity` model (with all its fields, relations, and indexes). Keep `ProductOption` and `ProductOptionValue` models completely unchanged.

- [ ] T013 Run the additive Prisma migration. Execute from `apps/backend/`: `pnpm prisma migrate dev --name add-fashion-domain-entities`. This creates the migration for new enums, FashionAttributes table, Occasion table, ProductOccasion table, baseCategory on Product, fitAdjustment on ProductVariant, and removes Gender/Material/Stone/Clarity. If Prisma asks about data loss for removed columns, confirm (development database only). Verify migration succeeds and `pnpm prisma generate` produces updated client types.

- [ ] T014 Create occasion seed data in `apps/backend/prisma/seed-occasions.ts`. Using Prisma client, upsert the 5 predefined occasions: (1) slug: "eid", nameEn: "Eid", nameAr: "عيد", position: 0; (2) slug: "wedding", nameEn: "Wedding", nameAr: "فرح", position: 1; (3) slug: "evening", nameEn: "Evening", nameAr: "سهره", position: 2; (4) slug: "casual", nameEn: "Casual", nameAr: "كاجوال", position: 3; (5) slug: "daily-elegance", nameEn: "Daily Elegance", nameAr: "أناقة يومية", position: 4. All isActive: true. Use `prisma.occasion.upsert({ where: { slug }, create: {...}, update: {...} })` for each. Export a `seedOccasions()` function and call it from the existing seed file or make it independently runnable.

**Checkpoint**: Database schema updated. Run `pnpm prisma validate` and `pnpm prisma studio` to verify new tables exist.

---

## Phase 3: User Story 1 — Structured Fashion Product Creation (Priority: P1) 🎯 MVP

**Goal**: CMS operators can create products with structured fashion attributes (fabric, embellishment, sleeve style, fit type, transparency layer), base category, and occasion associations. Active products require complete fashion attributes and at least one occasion.

**Independent Test**: Create a product in CMS with all fashion attributes filled → verify backend saves FashionAttributes record + ProductOccasion records. Attempt to activate without fashion attributes → verify 400 error.

### Implementation for User Story 1

- [ ] T015 [US1] Create backend occasion module at `apps/backend/src/modules/occasion/index.ts`. Follow the existing pattern from `apps/backend/src/modules/auth/index.ts` (ElysiaJS plugin with prefix). Create an Elysia plugin with `prefix: "/occasions"` that provides: (1) `GET /` — list all occasions ordered by position, filter by `isActive` query param; (2) `POST /` — create occasion (body: slug, nameEn, nameAr, descriptionEn?, descriptionAr?, isActive?, position?); (3) `PATCH /:id` — update occasion by id (partial body); (4) `DELETE /:id` — delete occasion, return 409 if products are associated. Use Elysia `t` typebox for body/param validation. Import `prisma` from `../../lib/prisma`.

- [ ] T016 [US1] Create backend occasion service at `apps/backend/src/modules/occasion/service.ts`. Follow the pattern from `apps/backend/src/modules/auth/service.ts` (abstract class with static methods, ServiceResult type). Methods: `list(isActive?: boolean)` — findMany with orderBy position; `getById(id: string)` — findUnique; `create(data)` — create with all fields; `update(id: string, data)` — update; `delete(id: string)` — check for associated ProductOccasion records first, return error if any exist, otherwise delete.

- [ ] T017 [US1] Create backend occasion model (Elysia typebox) at `apps/backend/src/modules/occasion/model.ts`. Follow the pattern from `apps/backend/src/modules/auth/model.ts`. Define: `createBody` with t.Object({ slug: t.String(), nameEn: t.String(), nameAr: t.String(), descriptionEn: t.Optional(t.String()), descriptionAr: t.Optional(t.String()), isActive: t.Optional(t.Boolean()), position: t.Optional(t.Number()) }). `updateBody` same fields all Optional. `occasionParams` with t.Object({ id: t.String() }).

- [ ] T018 [US1] Modify backend product service at `apps/backend/src/modules/product/service.ts`. In the product creation method: (1) Accept new fields in the create data: `baseCategory` (required string, must be "ABAYA" or "MODEST_DRESS"), `fashionAttributes` (object with fabric, embellishment, sleeveStyle, fitType, transparencyLayer, neckline?, length?), `occasionIds` (string[]), `occasionPositions` (Record<string, number>, optional). (2) When creating a product, use a Prisma transaction that: creates the Product with baseCategory, creates FashionAttributes via nested `fashionAttributes: { create: {...} }`, creates ProductOccasion records via `occasions: { create: occasionIds.map(id => ({ occasionId: id, position: occasionPositions?.[id] ?? 0 })) }`. (3) Add validation: if `isActive` is true, require fashionAttributes (all 5 required fields non-null) and at least 1 occasionId — return 400 error with descriptive message listing missing fields if validation fails. (4) In the product update method: support updating fashionAttributes via `fashionAttributes: { upsert: { create: {...}, update: {...} } }`, support updating occasionIds by deleting existing ProductOccasion records and creating new ones. (5) In product fetch methods (getBySlug, getById, list): include `fashionAttributes: true` and `occasions: { include: { occasion: true }, orderBy: { position: "asc" } }` in Prisma includes.

- [ ] T019 [US1] Modify backend product model (Elysia typebox) at `apps/backend/src/modules/product/model.ts`. Add to the create/update body schemas: (1) `baseCategory: t.String()` (required on create). (2) `fashionAttributes: t.Optional(t.Object({ fabric: t.String(), embellishment: t.Optional(t.String()), sleeveStyle: t.String(), fitType: t.String(), transparencyLayer: t.String(), neckline: t.Optional(t.String()), length: t.Optional(t.String()) }))`. (3) `occasionIds: t.Optional(t.Array(t.String()))`. (4) `occasionPositions: t.Optional(t.Record(t.String(), t.Number()))`. Remove `gender` from create/update body schemas. Remove `materialId`, `stoneId`, `clarityId` from create/update body schemas.

- [ ] T020 [US1] Register the occasion module in `apps/backend/src/index.ts`. Add `import { occasion } from "./modules/occasion";` at the top with other imports. Add `.use(occasion)` inside the `.group("/api", ...)` chain. Keep all existing module registrations.

- [ ] T021 [US1] Create CMS occasion management feature at `apps/cms/src/features/occasions/queries.ts`. Create a `fetchOccasions` function that calls `GET /api/occasions` using the existing API client pattern (see `apps/cms/src/features/products/queries.ts` for the fetch pattern). Also create `fetchOccasion(id: string)` for single occasion fetch.

- [ ] T022 [P] [US1] Create CMS occasion mutations at `apps/cms/src/features/occasions/mutations.ts`. Create functions: `createOccasion(body)`, `updateOccasion(id, body)`, `deleteOccasion(id)` — each calling the corresponding backend API endpoint. Follow the pattern from `apps/cms/src/features/products/mutations.ts`.

- [ ] T023 [US1] Create CMS occasion API hooks at `apps/cms/src/features/occasions/api.ts`. Follow the pattern from `apps/cms/src/features/products/api.ts`. Create: `occasionKeys` object, `useOccasions()` query hook, `useOccasion(id)` query hook, `useCreateOccasion()` mutation hook (invalidates list on success), `useUpdateOccasion()` mutation hook, `useDeleteOccasion()` mutation hook (invalidates list on success).

- [ ] T024 [US1] Create CMS occasion barrel export at `apps/cms/src/features/occasions/index.ts`. Export all from `./api`, `./queries`, `./mutations` — matching the pattern in `apps/cms/src/features/auth/index.ts`.

- [ ] T025 [US1] Create CMS BaseCategorySelect component at `apps/cms/src/features/products/components/BaseCategorySelect.tsx`. A React select component that renders a dropdown with two options: "Abaya" (value: "ABAYA") and "Modest Dress" (value: "MODEST_DRESS"). Props: `value: string`, `onChange: (value: string) => void`, `error?: string`. Use the existing Shadcn/ui Select component pattern from the CMS. Include both English labels (display) and store the enum value.

- [ ] T026 [US1] Create CMS FashionAttributesForm component at `apps/cms/src/features/products/components/FashionAttributesForm.tsx`. A React form section with dropdown selects for each fashion attribute field. Required fields (no empty option): fabric (10 values: CHIFFON, CREPE, SATIN, LACE, JERSEY, NIDHA, LINEN, VELVET, ORGANZA, GEORGETTE), embellishment (6 values: EMBROIDERY, BEADS, LACE_OVERLAY, CRYSTAL, SEQUINS, NONE — default NONE), sleeveStyle (6 values: CAPE, KIMONO, FLARED, FITTED, BELL, BATWING), fitType (4 values: FLOWY, RELAXED, STRUCTURED, A_LINE), transparencyLayer (3 values: INNER, OUTER, CLOSED). Optional fields (allow empty): neckline (6 values: ROUND, V_NECK, BOAT, STAND_COLLAR, HOODED, OPEN_FRONT), length (3 values: FULL_LENGTH, MIDI, KNEE_LENGTH). Props: `value: FashionAttributesInput`, `onChange: (value: FashionAttributesInput) => void`, `errors?: Record<string, string>`. Import label maps from `@ecommerce/shared-utils` for display names. Use Shadcn/ui Select components.

- [ ] T027 [US1] Create CMS OccasionSelector component at `apps/cms/src/features/products/components/OccasionSelector.tsx`. A multi-select component that fetches all active occasions via `useOccasions()` hook and lets the CMS operator select one or more. Props: `selectedIds: string[]`, `onChange: (ids: string[]) => void`, `error?: string`. Display occasion nameEn for each option. Each selected occasion should allow drag-to-reorder (or up/down arrows) to set position. The component must output both the selected IDs and their positions.

- [ ] T028 [US1] Modify CMS product create page at `apps/cms/src/pages/products/new.tsx` (or the equivalent product creation form). Integrate the three new components: (1) Add `<BaseCategorySelect>` in the basic info section (required field, before price). (2) Add `<FashionAttributesForm>` as a new collapsible section titled "Fashion Attributes" after the description fields. (3) Add `<OccasionSelector>` as a new section titled "Occasions" after fashion attributes. (4) Remove any existing material/stone/clarity/gender selector inputs. (5) Include `baseCategory`, `fashionAttributes`, `occasionIds`, and `occasionPositions` in the form submission payload sent to `POST /api/products`.

- [ ] T029 [US1] Modify CMS product edit page at `apps/cms/src/pages/products/edit.tsx` (or the equivalent product edit form). Same integrations as T028 but pre-populate: (1) `<BaseCategorySelect>` with existing product.baseCategory. (2) `<FashionAttributesForm>` with existing product.fashionAttributes values. (3) `<OccasionSelector>` with existing product.occasions mapped to IDs and positions. (4) Remove material/stone/clarity/gender inputs. (5) Include updated fields in the PATCH payload.

- [ ] T030 [US1] Modify CMS product mutations at `apps/cms/src/features/products/mutations.ts`. Update `CreateProductBody` type to include: `baseCategory: string`, `fashionAttributes?: {...}`, `occasionIds?: string[]`, `occasionPositions?: Record<string, number>`. Remove: `gender`, `materialId`, `stoneId`, `clarityId`. Update `UpdateProductBody` similarly. Ensure `createProduct()` and `updateProduct()` send these new fields in the request body.

**Checkpoint**: US1 complete. Create a product in CMS with baseCategory=ABAYA, all fashion attributes filled, 2 occasions selected. Verify in Prisma Studio: Product has baseCategory, FashionAttributes record exists with correct values, 2 ProductOccasion records exist. Try activating without fashion attrs → verify 400 error.

---

## Phase 4: User Story 2 — Fashion-Driven Product Browsing (Priority: P2)

**Goal**: Collection pages support filtering by fabric, occasion, fit type, and sleeve style. Product cards display occasion badges and fashion attribute summary.

**Independent Test**: Navigate to a collection page, apply fabric filter "CHIFFON" → only chiffon products appear. Apply occasion filter "eid" → only Eid products appear. Product cards show "Chiffon · Flowy · Cape Sleeves" summary and "Eid" badge.

### Implementation for User Story 2

- [ ] T031 [US2] Modify backend collection service at `apps/backend/src/modules/collection/service.ts`. In the method that fetches collection products (the one handling `GET /collections/:slug/products`): (1) Accept new query params: `fabric?: string`, `occasion?: string`, `fitType?: string`, `sleeveStyle?: string`. (2) Build Prisma `where` clause: if `fabric` is provided, add `fashionAttributes: { fabric: fabric }`. If `occasion` is provided, add `occasions: { some: { occasion: { slug: occasion } } }`. If `fitType` is provided, add `fashionAttributes: { fitType: fitType }`. If `sleeveStyle` is provided, add `fashionAttributes: { sleeveStyle: sleeveStyle }`. (3) Include `fashionAttributes: { select: { fabric: true, fitType: true, sleeveStyle: true } }` and `occasions: { include: { occasion: { select: { slug: true, nameEn: true, nameAr: true } } }, orderBy: { position: "asc" } }` in the product select. (4) Add `availableFilters` to the response: query distinct fabric/occasion/fitType/sleeveStyle values for products in this collection using Prisma groupBy or distinct queries.

- [ ] T032 [US2] Modify backend collection model (Elysia typebox) at `apps/backend/src/modules/collection/model.ts`. Add to the query schema for the collection products endpoint: `fabric: t.Optional(t.String())`, `occasion: t.Optional(t.String())`, `fitType: t.Optional(t.String())`, `sleeveStyle: t.Optional(t.String())`.

- [ ] T033 [US2] Modify backend collection routes at `apps/backend/src/modules/collection/index.ts`. Pass the new query params (fabric, occasion, fitType, sleeveStyle) from the request query to the service method. These should be read from `query` object and passed to the service.

- [ ] T034 [P] [US2] Create marketing OccasionBadge component at `apps/marketing/src/components/occasion/OccasionBadge.tsx`. A small badge component that displays an occasion name (e.g., "Eid", "Wedding"). Props: `nameEn: string`, `nameAr: string`, `slug: string`, `locale: string`. Use the current locale to display either nameEn or nameAr. Style as a small pill/tag with subtle background color. Use Tailwind CSS.

- [ ] T035 [P] [US2] Create marketing FashionAttributeSummary component at `apps/marketing/src/components/fashion-attributes/FashionAttributeSummary.tsx`. Displays a short inline text like "Chiffon · Flowy · Cape Sleeves" on product cards. Props: `fabric: string`, `fitType: string`, `sleeveStyle: string`, `locale: string`. Import label maps from `@ecommerce/shared-utils` to convert enum values to human-readable labels (EN or AR based on locale). Render as a single line of text with `·` separator. Use Tailwind CSS with muted text color.

- [ ] T036 [US2] Create marketing OccasionFilter component at `apps/marketing/src/components/occasion/OccasionFilter.tsx`. A filter widget for the collection page filter drawer. Props: `occasions: { slug: string; nameEn: string; nameAr: string }[]`, `selected: string | null`, `onChange: (slug: string | null) => void`, `locale: string`. Renders as a list of clickable filter chips/buttons. Selected state has active styling. Clicking the already-selected one clears the filter (passes null).

- [ ] T037 [P] [US2] Create marketing FabricFilter component at `apps/marketing/src/components/fashion-attributes/FabricFilter.tsx`. Similar pattern to OccasionFilter. Props: `fabrics: string[]`, `selected: string | null`, `onChange: (value: string | null) => void`, `locale: string`. Display each fabric as a clickable chip using localized labels from `@ecommerce/shared-utils`. Same selection/deselection UX.

- [ ] T038 [P] [US2] Create marketing FitTypeFilter component at `apps/marketing/src/components/fashion-attributes/FitTypeFilter.tsx`. Same pattern as FabricFilter. Props: `fitTypes: string[]`, `selected: string | null`, `onChange: (value: string | null) => void`, `locale: string`.

- [ ] T039 [US2] Modify the marketing collection page at `apps/marketing/src/app/[locale]/collections/[slug]/page.tsx` (or wherever the collection products grid is rendered). (1) Read `fabric`, `occasion`, `fitType`, `sleeveStyle` from URL search params. (2) Pass them as query params when fetching collection products from the API. (3) Add the filter components (OccasionFilter, FabricFilter, FitTypeFilter) to the existing filter drawer/sidebar, populated from the `availableFilters` field in the API response. (4) When a filter is selected, update the URL search params and re-fetch. (5) On each product card in the grid, render `<OccasionBadge>` for the first occasion and `<FashionAttributeSummary>` with fabric/fitType/sleeveStyle from the product's fashionAttributes.

- [ ] T040 [US2] Update marketing API client at `apps/marketing/src/lib/api.ts` (or equivalent). Modify the collection products fetch function to accept and pass the new query params: `fabric`, `occasion`, `fitType`, `sleeveStyle`. Parse the `availableFilters` field from the response.

**Checkpoint**: US2 complete. Visit a collection page with fashion products. Filter by fabric=CHIFFON → only chiffon products. Filter by occasion=eid → only Eid products. Product cards show occasion badge and "Chiffon · Flowy · Cape" summary.

---

## Phase 5: User Story 3 — Occasion-Based Discovery via Filters (Priority: P3)

**Goal**: Occasion filter works in combination with other filters. Applying occasion "Eid" + fabric "Chiffon" shows only Eid chiffon products. Clearing occasion filter restores all products.

**Independent Test**: On a collection page, apply "Eid" occasion filter → verify only Eid products appear. Then also apply "Chiffon" fabric filter → verify intersection. Clear occasion → verify Chiffon products from all occasions appear. Clear all → verify all products return.

### Implementation for User Story 3

- [ ] T041 [US3] Verify and fix combined filter logic in backend collection service at `apps/backend/src/modules/collection/service.ts`. Ensure all fashion filters (fabric, occasion, fitType, sleeveStyle) are AND-combined in the Prisma `where` clause. The where clause should combine collection membership + all active filters. Test that the SQL query correctly joins through fashionAttributes and occasions relations simultaneously. If filters are already correctly AND-combined from T031, this task is a verification pass — if not, fix the where clause to use `AND: [...]` array for combining conditions.

- [ ] T042 [US3] Ensure marketing filter state management supports multi-filter combinations at `apps/marketing/src/app/[locale]/collections/[slug]/page.tsx`. When multiple filters are active (e.g., occasion=eid AND fabric=CHIFFON), all should appear in URL search params (e.g., `?occasion=eid&fabric=CHIFFON`). When one filter is cleared, only that param is removed — others persist. Add a "Clear All Filters" button that removes all fashion filter params at once.

- [ ] T043 [US3] Add empty state for filtered results in the marketing collection page. When filters are applied but no products match, display a friendly empty state message: "No products match your filters" (EN) / "لا توجد منتجات تطابق المرشحات" (AR) with a "Clear Filters" button. This replaces a blank grid, not a 404.

**Checkpoint**: US3 complete. Apply Eid + Chiffon filters → only matching products. Clear Eid → all Chiffon products. Clear all → all products. Empty filters → empty state with message.

---

## Phase 6: User Story 4 — Fashion-Enriched Product Detail Page (Priority: P4)

**Goal**: Product detail pages show structured "Key Features" section (fabric, fit, sleeves, length, transparency), occasion badges, and clear separation between narrative description and structured attributes — matching byfatimaa.com styling.

**Independent Test**: Navigate to a product page with complete fashion attributes. Verify: Key Features section visible with all attributes, occasion badges displayed, narrative description in separate section.

### Implementation for User Story 4

- [ ] T044 [P] [US4] Create marketing KeyFeatures component at `apps/marketing/src/components/fashion-attributes/KeyFeatures.tsx`. A structured display section showing all fashion attributes as labeled values. Props: `attributes: FashionAttributes`, `locale: string`. Render as a styled list/grid: "Fabric: Chiffon", "Fit: Flowy", "Sleeves: Cape", "Length: Full Length", "Embellishment: Embroidery", "Transparency: Closed". Only show optional fields (neckline, length) if they have values. Use localized labels from `@ecommerce/shared-utils`. Match byfatimaa.com's "Key Features" bullet-point style — clean, minimal, with subtle icons or labels. Use Tailwind CSS.

- [ ] T045 [P] [US4] Create marketing OccasionBadgeList component at `apps/marketing/src/components/occasion/OccasionBadgeList.tsx`. Renders a horizontal row of OccasionBadge components for all occasions associated with a product. Props: `occasions: { slug: string; nameEn: string; nameAr: string }[]`, `locale: string`. Renders each as an `<OccasionBadge>`. Wrap with flexbox, gap spacing.

- [ ] T046 [US4] Modify the marketing product detail page at `apps/marketing/src/app/[locale]/products/[slug]/page.tsx` (or equivalent). (1) Add `<KeyFeatures attributes={product.fashionAttributes} />` in a section titled "Key Features" (EN) / "المواصفات" (AR), placed after the product image gallery and before/alongside the add-to-cart section. (2) Add `<OccasionBadgeList occasions={product.occasions} />` near the product title or price area. (3) Ensure the narrative `descriptionEn`/`descriptionAr` is rendered in its own separate section titled "Description" — visually distinct from Key Features. (4) Ensure `baseCategory` is displayed as a breadcrumb or label (e.g., "Abayas" or "Modest Dresses").

- [ ] T047 [US4] Update the marketing product data fetching to include fashion attributes and occasions. Wherever `GET /api/products/:slug` is called, ensure the response includes `fashionAttributes` (full object with all 7 fields) and `occasions` (array with slug, nameEn, nameAr, position). The backend already returns these from T018 — this task is to ensure the marketing frontend types and data hooks correctly type and pass this data to the components.

**Checkpoint**: US4 complete. View a product page → Key Features section shows all attributes, occasion badges are visible, description is in a separate section from structured attributes.

---

## Phase 7: User Story 5 — Modest Sizing with Fit Adjustment (Priority: P5)

**Goal**: Product variant size selectors show fit adjustment info (e.g., "52 — Loose Fit"). Products with transparencyLayer="OUTER" show a layering notice.

**Independent Test**: View a product with fitAdjustment=LOOSE on a variant → "Loose Fit" label appears next to size. View an open abaya (transparencyLayer=OUTER) → layering notice appears.

### Implementation for User Story 5

- [ ] T048 [P] [US5] Create marketing LayeringNotice component at `apps/marketing/src/components/fashion-attributes/LayeringNotice.tsx`. A notice banner displayed on product pages when `transparencyLayer === "OUTER"`. Displays: "This is an open-front abaya. An inner dress is recommended for layering." (EN) / Arabic equivalent. Props: `transparencyLayer: string`, `locale: string`. Only renders if `transparencyLayer === "OUTER"`. Style as an info banner with subtle background (e.g., light amber or blue). Use Tailwind CSS.

- [ ] T049 [US5] Modify the marketing product page size selector (wherever variant sizes are rendered, typically in `apps/marketing/src/app/[locale]/products/[slug]/page.tsx` or a dedicated SizeSelector component). For each variant that has `fitAdjustment` set, append the fit label next to the size label. Example: instead of just "52", display "52 — Loose Fit". Use localized labels from `@ecommerce/shared-utils` (LOOSE → "Loose Fit"/"مريح", RELAXED → "Relaxed Fit"/"مسترخي", STRUCTURED → "Structured Fit"/"مهيكل"). Only show fit label if `fitAdjustment` is non-null.

- [ ] T050 [US5] Add `<LayeringNotice transparencyLayer={product.fashionAttributes?.transparencyLayer} />` to the marketing product detail page. Place it prominently — either below the Key Features section or near the size selector — so customers see it before selecting a size.

- [ ] T051 [US5] Modify CMS variant form (wherever variant creation/editing happens — likely in a VariantMatrix or VariantForm component). Add a `fitAdjustment` dropdown select per variant with options: empty (none), "Loose" (LOOSE), "Relaxed" (RELAXED), "Structured" (STRUCTURED). Include this field in the variant create/update payload sent to the backend.

- [ ] T052 [US5] Modify backend product variant handling in `apps/backend/src/modules/product/service.ts`. Ensure variant create and update operations accept and persist the `fitAdjustment` field. In variant create: include `fitAdjustment` in the Prisma create data. In variant update: include `fitAdjustment` in the Prisma update data. In variant fetch: include `fitAdjustment` in the select.

**Checkpoint**: US5 complete. Product with LOOSE variant shows "52 — Loose Fit" in size selector. Open abaya (OUTER transparency) shows layering notice. Closed abaya shows no notice.

---

## Phase 8: User Story 6 — Jewellery Attribute Removal & Data Migration (Priority: P6)

**Goal**: Remove all jewellery-specific entities, routes, and UI from all three apps. Material, Stone, Clarity no longer exist. Gender is gone.

**Independent Test**: Verify Material/Stone/Clarity models don't exist in schema. Verify `/api/material`, `/api/stone`, `/api/clarity` endpoints return 404. Verify CMS has no material/stone/clarity/gender inputs.

### Implementation for User Story 6

- [ ] T053 [US6] Remove backend jewellery modules. Delete the following directories entirely: `apps/backend/src/modules/material/` (index.ts, model.ts, service.ts), `apps/backend/src/modules/stone/` (index.ts, model.ts, service.ts), `apps/backend/src/modules/clarity/` (index.ts, model.ts, service.ts).

- [ ] T054 [US6] Update `apps/backend/src/index.ts` to remove jewellery module registrations. Remove import lines: `import { material } from "./modules/material"`, `import { stone } from "./modules/stone"`, `import { clarity } from "./modules/clarity"`. Remove `.use(material)`, `.use(stone)`, `.use(clarity)` from the `.group("/api", ...)` chain. Keep all other module registrations unchanged.

- [ ] T055 [US6] Remove jewellery-related CMS features. Search the CMS codebase for any material/stone/clarity selector components, pages, API hooks, queries, or mutations. Remove: (1) Any Material/Stone/Clarity management pages (list, create, edit). (2) Any material/stone/clarity selector dropdowns in product forms. (3) Any React Query hooks for material/stone/clarity. (4) Any API mutation functions for material/stone/clarity. Look in `apps/cms/src/features/` and `apps/cms/src/pages/` for these.

- [ ] T056 [US6] Remove gender-related code from all apps. In the CMS: remove any gender selector dropdown from product create/edit forms. In the marketing app: remove any gender-based collection page routes (e.g., `/collections/men`, `/collections/women`), remove any gender filter from collection filter drawer, remove any gender display on product cards/pages. In the backend: remove any gender-based filtering logic in product/collection services. In shared-types: the Gender enum was already removed in T006.

- [ ] T057 [US6] Update backend search module at `apps/backend/src/modules/search/service.ts`. Remove any references to `gender`, `materialId`, `stoneId`, `clarityId` in search queries. Add fashion-aware search support: accept `fabric`, `occasion`, `fitType`, `baseCategory` as query params. Build Prisma where clauses that filter through `fashionAttributes` and `occasions` relations, same pattern as collection filtering (T031).

- [ ] T058 [US6] Update backend search model at `apps/backend/src/modules/search/model.ts`. Remove `gender` from query schema. Add: `fabric: t.Optional(t.String())`, `occasion: t.Optional(t.String())`, `fitType: t.Optional(t.String())`, `baseCategory: t.Optional(t.String())`.

- [ ] T059 [US6] Update backend search routes at `apps/backend/src/modules/search/index.ts`. Pass new query params (fabric, occasion, fitType, baseCategory) to the search service. Remove any gender param passing.

**Checkpoint**: US6 complete. `/api/material` returns 404. CMS has no material/stone/clarity/gender inputs. Products no longer have gender field. Search supports fashion-aware queries.

---

## Phase 9: Polish & Cross-Cutting Concerns

**Purpose**: Final cleanup, consistency checks, and cross-cutting improvements.

- [ ] T060 [P] Verify all Prisma includes across the backend consistently include `fashionAttributes` and `occasions` when fetching products. Check: product list, product detail, collection products, search results, cart items, order items, wishlist items, favourites. Add includes where missing.

- [ ] T061 [P] Verify AR/EN localization completeness. Check that all new CMS form labels have both English and Arabic text. Check that all marketing display components use locale-aware label maps. Check that occasion seed data has both nameEn and nameAr populated.

- [ ] T062 Run `pnpm build` from repo root to verify all workspaces compile without errors. Fix any TypeScript errors caused by removed types (Gender, Material, Stone, Clarity) or added types (BaseCategory, FashionAttributes, etc.) across all three apps.

- [ ] T063 Run `pnpm prisma validate` from `apps/backend/` to verify schema integrity. Run `pnpm prisma generate` to ensure Prisma client types are up to date.

- [ ] T064 Verify the quickstart flow end-to-end: seed occasions (T014), create a product with fashion attributes via CMS, view it on the marketing collection page with filters, view the product detail page with Key Features section.

- [ ] T065 Verify collection filter performance meets SC-003 (<500ms response). Use Prisma query analysis (`prisma.$queryRaw` with `EXPLAIN ANALYZE`) or load testing with k6/Artillery to confirm filter queries return within 500ms for typical dataset (~200 products). Document baseline performance in quickstart.md.

---

## Dependencies & Execution Order

### Phase Dependencies

- **Setup (Phase 1)**: No dependencies — can start immediately
- **Foundational (Phase 2)**: Depends on Phase 1 (shared types must exist for Prisma type alignment)
- **User Stories (Phase 3–8)**: All depend on Phase 2 completion (schema must be migrated)
  - US1 (Phase 3): Can start after Phase 2 — no other story dependencies
  - US2 (Phase 4): Depends on US1 (products with fashion data must be creatable)
  - US3 (Phase 5): Depends on US2 (filter infrastructure must exist)
  - US4 (Phase 6): Depends on US1 (fashion data must exist on products)
  - US5 (Phase 7): Depends on US1 (variant fitAdjustment must be settable)
  - US6 (Phase 8): Can start after Phase 2 — independent of other stories (removal work)
- **Polish (Phase 9)**: Depends on all desired user stories being complete

### User Story Dependencies

- **US1 (P1)**: Phase 2 → US1. No other story dependencies. **MVP target.**
- **US2 (P2)**: Phase 2 → US1 → US2 (needs products with fashion attrs)
- **US3 (P3)**: Phase 2 → US1 → US2 → US3 (extends US2 filtering)
- **US4 (P4)**: Phase 2 → US1 → US4 (needs fashion attrs on products)
- **US5 (P5)**: Phase 2 → US1 → US5 (needs fitAdjustment on variants)
- **US6 (P6)**: Phase 2 → US6 (independent removal work, can parallel with US2–US5)

### Parallel Opportunities

Within each phase, tasks marked [P] can run in parallel:
- **Phase 1**: T001, T002, T003, T004, T005 are all parallel (different files)
- **Phase 3 (US1)**: T021, T022 parallel; T025, T026, T027 parallel (different components)
- **Phase 4 (US2)**: T034, T035, T037, T038 parallel (different components)
- **Phase 6 (US4)**: T044, T045 parallel (different components)

---

## Parallel Example: Phase 1

```text
# All of these can run simultaneously (different files in packages/):
Task T001: Create fashion-enums.ts in packages/shared-types/src/
Task T002: Create fashion-attributes.ts in packages/shared-types/src/
Task T003: Create occasion.ts in packages/shared-types/src/
Task T004: Create fashion-labels.ts in packages/shared-utils/src/
Task T005: Create fashion-validators.ts in packages/shared-utils/src/
```

## Parallel Example: User Story 2 Components

```text
# All marketing components can be built simultaneously:
Task T034: OccasionBadge component
Task T035: FashionAttributeSummary component
Task T037: FabricFilter component
Task T038: FitTypeFilter component
```

---

## Implementation Strategy

### MVP First (User Story 1 Only)

1. Complete Phase 1: Setup (T001–T008)
2. Complete Phase 2: Foundational (T009–T014)
3. Complete Phase 3: User Story 1 (T015–T030)
4. **STOP and VALIDATE**: Create a product in CMS with fashion attrs + occasions. Verify in Prisma Studio.
5. Deploy/demo if ready — CMS operators can now create fashion products.

### Incremental Delivery

1. Setup + Foundational → Schema ready
2. Add US1 → Fashion product creation works (MVP!)
3. Add US2 → Collection filtering works → Deploy/Demo
4. Add US3 → Combined filters work → Deploy/Demo
5. Add US4 → Product detail pages enriched → Deploy/Demo
6. Add US5 → Sizing with fit adjustment → Deploy/Demo
7. Add US6 → Jewellery artifacts removed → Deploy/Demo
8. Polish → Full validation pass

### Parallel Team Strategy

With multiple developers after Phase 2:

- Developer A: US1 (P1 — MVP)
- Developer B: US6 (P6 — independent removal work)
- After US1 completes:
  - Developer A: US2 + US3 (filter chain)
  - Developer C: US4 + US5 (product detail enrichment)

---

## Notes

- [P] tasks = different files, no dependencies
- [Story] label maps task to specific user story for traceability
- Each user story should be independently completable and testable
- Commit after each task or logical group
- Stop at any checkpoint to validate story independently
- Backend uses ElysiaJS with `t` (typebox) for route validation — NOT Zod directly in routes
- CMS uses React Query hooks with `@tanstack/react-query`
- Marketing uses Next.js 15 with `[locale]` routing
- Shared packages use `@ecommerce/shared-types` and `@ecommerce/shared-utils` workspace imports
- All enum values use UPPER_SNAKE_CASE matching Prisma convention
