# Feature Specification: Fashion Domain Evolution

**Feature Branch**: `001-fashion-domain-evolution`
**Created**: 2026-04-14
**Status**: Draft
**Input**: User description: "Evolve the monorepo from a generic jewellery e-commerce system into a modest fashion platform (abaya/jalabiya/modest dress) with structured fashion attributes, occasion-driven discovery, and collection-based browsing — modeled after byfatimaa.com"

## Current System Audit

### Backend Domain Models (Existing)

The current system is built around a **jewellery domain** with the following entities:

- **Product**: Flat model with `materialId`, `stoneId`, `clarityId` (jewellery-specific). Has `gender` (MEN/WOMEN/UNISEX), `badge` (NEW/BESTSELLER/LIMITED_EDITION), `collectionId` (single collection). No fashion attributes.
- **ProductVariant**: SKU-driven with price/stock. No fit adjustment or layering logic.
- **Collection**: Hierarchical parent-child. Has banner/image. No filter configurations.
- **Material / Stone / Clarity**: Jewellery-specific attribute entities with 1:N to Product.
- **ProductOption / ProductOptionValue**: Generic option system (e.g., "Size", "Color") — free-text, unconstrained.
- **ProductCustomField**: Generic custom fields for tailoring — unstructured.
- **Review**: Basic rating/content model.
- **Order / Cart / Coupon / User / Address**: Standard e-commerce — no fashion-specific logic.
- **Banner / InstagramPost / Page / Policy / ShoppableVideo**: Content models — domain-agnostic.
- **AnalyticsEvent / AnalyticsDailyStat**: Event tracking — no fashion-specific event types.
- **FormSubmission**: Generic form handling — no fashion-specific form types.

### Marketing App (Existing)

- **Product Page** (`/products/[slug]`): Renders product with variant selection, image gallery, reviews, related products (by collection). No fashion attribute display, no occasion badges.
- **Collection Page** (`/collections/[slug]`): Product grid with filters for price, availability, and sort. No fabric/occasion/fit filters.
- **Collections Index** (`/collections`): Lists all collections with product counts.
- **Home Page**: Hero banners, featured products, Instagram posts. No occasion-based sections.

### CMS App (Existing)

- **Product Create/Edit**: Form with basic info, jewellery attributes (material/stone/clarity), generic options, variant matrix, custom fields, SEO. No fashion attribute inputs, no occasion assignment, no base category selection.
- **Collection Management**: Basic CRUD with banner/image. No filter configuration.
- **No management UI for**: Occasions, fashion attributes, fabric types, sleeve styles, fit types.

### Reference System (By Fatima — byfatimaa.com)

Key domain patterns observed:

- **Collections**: "Abayas", "Modest Dresses" — category-based entry points with product grids
- **Product Pages**: Display "Key Features" (fabric, silhouette, sleeve style, occasion suitability), size guide, installment payment info
- **Product Naming**: Descriptive, style-driven ("The Amethyst Geometric Link Abaya", "Sage Grace", "Midnight Lace Open Abaya")
- **Key Features on Products**: Structured bullet points — "Open-front abaya design", "Lightweight flowy fabric", "Full-length silhouette", "Comfortable wide sleeves", "Ideal for formal, evening & special occasions"
- **FAQ on Home Page**: "What fabric is used?", "What occasions is this dress suitable for?", "What size should I choose?", "Is the fit loose or fitted?"
- **URL Patterns**: `/products/{slug}`, `/collections/{slug}`, `/collections/{slug}/products/{slug}`

## User Scenarios & Testing *(mandatory)*

### User Story 1 - Structured Fashion Product Creation (Priority: P1)

A CMS operator creates a new abaya product. They must fill in structured fashion attributes (fabric, embellishment, sleeve style, fit type, occasion associations) alongside the existing basic info. The system enforces that no product is published without complete fashion attributes and at least one occasion.

**Why this priority**: Without structured fashion data, no other feature (filtering, occasion browsing, attribute display) can function. This is the data foundation.

**Independent Test**: Create a product in CMS with all fashion attributes filled, verify it appears in the backend with a complete FashionAttributes record and at least one Occasion association. Attempt to publish without fashion attributes — verify validation error.

**Acceptance Scenarios**:

1. **Given** a CMS operator is creating a new product, **When** they fill in all required fields including fashion attributes and occasion, **Then** the product is saved with a complete FashionAttributes entity and at least one ProductOccasion record
2. **Given** a CMS operator is creating a new product, **When** they attempt to publish without filling required fashion attributes (fabric, fitType, sleeveStyle), **Then** the system rejects the submission with a validation error listing missing fields
3. **Given** a CMS operator is creating a new product, **When** they select base category "Abaya" or "Modest Dress", **Then** the fashion attribute form adapts to show category-relevant defaults (e.g., transparencyLayer options for abayas)

---

### User Story 2 - Fashion-Driven Product Browsing (Priority: P2)

A customer visits the marketing storefront and browses the "Abayas" collection. They filter by fabric (chiffon), occasion (Eid), and fit type (flowy). The product grid shows matching products with occasion badges and key fashion attribute highlights.

**Why this priority**: This is the core customer-facing value proposition — browsing by fashion semantics, not by SKU. Depends on P1 (data must exist).

**Independent Test**: Given products with fashion attributes exist, navigate to a collection page, apply fabric/occasion/fit filters, verify only matching products appear and each product card shows occasion badge and key attribute summary.

**Acceptance Scenarios**:

1. **Given** products with fashion attributes exist in the "Abayas" collection, **When** a customer applies a fabric filter (e.g., "Chiffon"), **Then** only products with fabric=chiffon appear in the grid
2. **Given** products with occasion associations exist, **When** a customer applies an occasion filter (e.g., "Eid"), **Then** only products associated with the Eid occasion appear
3. **Given** a product has fashion attributes and occasion associations, **When** it appears in a product grid, **Then** the card displays an occasion badge and a short attribute summary (e.g., "Chiffon · Flowy · Cape Sleeves")

---

### User Story 3 - Occasion-Based Discovery via Filters (Priority: P3)

A customer looking for an Eid outfit visits the "Abayas" collection page and filters by occasion "Eid". The product grid narrows to show only Eid-suitable abayas. Occasion is a filter dimension within existing collection pages, not a separate route — matching byfatimaa.com's pattern.

**Why this priority**: Occasion-driven shopping is the primary browsing pattern in modest fashion. Depends on P1 (occasion data) and P2 (filtering infrastructure).

**Independent Test**: Navigate to a collection page, apply an occasion filter (e.g., "Eid"), verify only products associated with that occasion appear, verify other filters (fabric, fit) work in combination with the occasion filter.

**Acceptance Scenarios**:

1. **Given** products with occasion associations exist in a collection, **When** a customer applies an occasion filter (e.g., "Eid"), **Then** only products associated with Eid are displayed
2. **Given** the Eid filter is active on a collection page, **When** the customer also filters by "Chiffon" fabric, **Then** only Eid-associated chiffon products appear
3. **Given** the Eid filter is active, **When** the customer clears the occasion filter, **Then** all products in the collection are displayed again

---

### User Story 4 - Fashion-Enriched Product Detail Page (Priority: P4)

A customer views a product detail page that displays structured fashion attributes (fabric, embellishment, sleeve style, fit type, transparency layer), occasion suggestions, and a "Key Features" section — matching the luxury storytelling pattern of byfatimaa.com.

**Why this priority**: Product detail pages are the conversion point. Fashion attributes must be visible and structured, not buried in prose. Depends on P1 (data).

**Independent Test**: Navigate to a product page that has complete fashion attributes, verify the page displays a structured "Key Features" section, occasion badges, and all fashion attributes in a dedicated section separate from the narrative description.

**Acceptance Scenarios**:

1. **Given** a product has complete fashion attributes, **When** a customer views the product page, **Then** a "Key Features" section displays structured attributes (fabric, fit, sleeves, length, transparency)
2. **Given** a product has occasion associations, **When** a customer views the product page, **Then** occasion badges appear with links to the respective occasion collection pages
3. **Given** a product has narrative description AND structured attributes, **When** a customer views the product page, **Then** the narrative description and structured attributes are displayed in separate, distinct sections

---

### User Story 5 - Modest Sizing with Fit Adjustment (Priority: P5)

A customer selecting a size on a product page sees fit adjustment information (loose/relaxed/structured) alongside the standard size label. For open abayas, the page indicates layering compatibility (inner dress recommended).

**Why this priority**: Modest sizing logic is unique to this domain and impacts purchase decisions. Depends on P1 (variant data model).

**Independent Test**: View a product with fit adjustment data, verify fit type is shown next to size options, verify layering info is displayed for open-style garments.

**Acceptance Scenarios**:

1. **Given** a product variant has fitAdjustment="loose", **When** a customer views size options, **Then** the fit type "Loose Fit" is displayed alongside the size label
2. **Given** a product has transparencyLayer="outer" (open abaya), **When** a customer views the product page, **Then** a layering notice appears indicating an inner dress is recommended
3. **Given** a product has transparencyLayer="closed", **When** a customer views the product page, **Then** no layering notice appears

---

### User Story 6 - Jewellery Attribute Removal & Data Migration (Priority: P6)

The system removes jewellery-specific entities (Material, Stone, Clarity) and their references from the Product model. Existing product data referencing these entities is migrated or cleaned.

**Why this priority**: Removing the wrong domain model is necessary to prevent confusion and maintain data integrity. Can be done after new fashion attributes are in place.

**Independent Test**: After migration, verify that Material, Stone, and Clarity entities no longer exist in the schema, Product has no materialId/stoneId/clarityId fields, and any products that previously referenced these have been updated.

**Acceptance Scenarios**:

1. **Given** the migration is complete, **When** the schema is inspected, **Then** Material, Stone, and Clarity models do not exist
2. **Given** the migration is complete, **When** a Product record is inspected, **Then** no materialId, stoneId, or clarityId fields exist
3. **Given** products previously had jewellery attributes, **When** migration runs, **Then** those products retain their basic info but jewellery attributes are removed without data loss in other fields

---

### Edge Cases

- What happens when a product is created with baseCategory "Abaya" but no transparencyLayer specified? (Should default to "closed" for abayas)
- What happens when a product is associated with zero occasions? (Should be a validation error — constitution requires at least one)
- What happens when a collection page receives a fabric filter value that doesn't match any product's FashionAttributes? (Should show empty state with "No products match" message)
- What happens when an occasion landing page has no products associated yet? (Should show empty curated state, not a 404)
- What happens when a CMS operator changes a product's baseCategory from "Abaya" to "Modest Dress"? (FashionAttributes should persist but UI may show category-relevant defaults)
- How does the system handle a product that appears in multiple occasions AND multiple collections? (Both N:N relationships must resolve independently)

## Requirements *(mandatory)*

### Functional Requirements

- **FR-001**: System MUST introduce a FashionAttributes entity with fields: fabric (enum), embellishment (enum), sleeveStyle (enum), neckline (enum), fitType (enum), length (enum), transparencyLayer (enum: inner/outer/closed)
- **FR-002**: System MUST establish a 1:1 relationship between Product and FashionAttributes (every product has exactly one FashionAttributes record)
- **FR-003**: System MUST introduce an Occasion entity with fields: name, nameAr, slug, description, descriptionAr, isActive, position
- **FR-004**: System MUST establish an N:N relationship between Product and Occasion via a join entity (ProductOccasion)
- **FR-005**: System MUST add a baseCategory field to Product constrained to values: ABAYA, MODEST_DRESS (schema-enforced enum). Jalabiyas are categorized under MODEST_DRESS, not as a separate base category.
- **FR-006**: System MUST add fitAdjustment field to ProductVariant constrained to values: LOOSE, RELAXED, STRUCTURED (schema-enforced enum)
- **FR-007**: System MUST remove Material, Stone, and Clarity entities and their foreign key fields from Product (materialId, stoneId, clarityId)
- **FR-008**: System MUST remove the Gender enum from Product entirely and replace it with baseCategory as the primary product axis. All products are implicitly women's. Gender-based collection pages (e.g., /collections/men, /collections/women) and gender filters MUST be removed from all three apps.
- **FR-009**: System MUST enforce that no Product can be active without a complete FashionAttributes record. Required fields: fabric, fitType, sleeveStyle, transparencyLayer, embellishment (defaults to NONE). Optional fields: neckline, length
- **FR-010**: System MUST enforce that no Product can be active without at least one Occasion association
- **FR-011**: System MUST support occasion-based filtering on collection and search endpoints (occasion as a primary filter dimension equal to price and category)
- **FR-012**: System MUST support fabric, fitType, and sleeveStyle filtering on collection and search endpoints
- **FR-013**: System MUST support occasion as a filter dimension within collection pages (not as separate landing pages). Occasion filtering MUST be available on all collection pages alongside fabric, fit type, price, and availability filters
- **FR-014**: System MUST display structured fashion attributes on product detail pages in a dedicated section separate from narrative description
- **FR-015**: System MUST display occasion badges on product cards in collection grids
- **FR-016**: System MUST display fitAdjustment information alongside size labels on product pages
- **FR-017**: System MUST display layering compatibility notices for products with transparencyLayer="outer"
- **FR-018**: CMS MUST provide structured fashion attribute input fields (dropdowns with constrained values, not free-text) when creating/editing products
- **FR-019**: CMS MUST provide occasion multi-select when creating/editing products
- **FR-020**: CMS MUST provide baseCategory selection when creating/editing products
- **FR-021**: CMS MUST provide fitAdjustment selection per variant when creating/editing products
- **FR-022**: System MUST remove jewellery-specific attribute management (Material, Stone, Clarity CRUD) from CMS
- **FR-023**: Collection filter drawer in marketing app MUST include fabric, occasion, and fit type filters alongside existing price and availability filters
- **FR-024**: Search MUST support fashion-aware queries (by fabric, occasion, style, silhouette) in addition to product name search

### Key Entities

- **FashionAttributes**: Structured fashion data for a product — fabric, embellishment, sleeveStyle, neckline, fitType, length, transparencyLayer. 1:1 with Product. All fields are constrained enums, not free-text.
- **Occasion**: A named occasion context (Eid, Wedding, Evening, Casual, Daily Elegance). Has localized name/description, slug, active state. N:N with Product via ProductOccasion.
- **ProductOccasion**: Join entity linking Product to Occasion with a position field for editorial curation — allows CMS operators to control product ordering within each occasion context, enabling styled/curated presentation matching byfatimaa.com's editorial collection sections.
- **Product (modified)**: Remove materialId/stoneId/clarityId. Add baseCategory (ABAYA/MODEST_DRESS). Replace Gender with baseCategory as primary axis. Jalabiyas fall under MODEST_DRESS. Add FashionAttributes (1:1). Add Occasions (N:N via ProductOccasion).
- **ProductVariant (modified)**: Add fitAdjustment (LOOSE/RELAXED/STRUCTURED).
- **Collection (unchanged)**: Existing model is adequate — hierarchical, with banner/image. Filter configurations can be added later as a separate feature.

## Success Criteria *(mandatory)*

### Measurable Outcomes

- **SC-001**: Every active product in the system has a complete FashionAttributes record with no null required fields (fabric, fitType, sleeveStyle)
- **SC-002**: Every active product in the system has at least one Occasion association
- **SC-003**: Collection pages support filtering by fabric, occasion, and fit type with results returned in under 500ms
- **SC-004**: Collection pages with occasion filter active display only products associated with that occasion
- **SC-005**: Product detail pages display structured fashion attributes in a dedicated section, separate from narrative description
- **SC-006**: CMS product creation form enforces fashion attribute completeness before allowing product activation
- **SC-007**: No jewellery-specific entities (Material, Stone, Clarity) or their foreign keys remain in the schema after migration
- **SC-008**: Product variant size labels include fit adjustment information (loose/relaxed/structured)
- **SC-009**: Products with transparencyLayer="outer" display layering compatibility notices on the storefront

## Clarifications

### Session 2026-04-14

- Q: What are the concrete enum values for FashionAttributes fields? → A: Comprehensive set (Option A) — Fabric: CHIFFON, CREPE, SATIN, LACE, JERSEY, NIDHA, LINEN, VELVET, ORGANZA, GEORGETTE; Embellishment: EMBROIDERY, BEADS, LACE_OVERLAY, CRYSTAL, SEQUINS, NONE; SleeveStyle: CAPE, KIMONO, FLARED, FITTED, BELL, BATWING; Neckline: ROUND, V_NECK, BOAT, STAND_COLLAR, HOODED, OPEN_FRONT; FitType: FLOWY, RELAXED, STRUCTURED, A_LINE; Length: FULL_LENGTH, MIDI, KNEE_LENGTH; TransparencyLayer: INNER, OUTER, CLOSED. Note: Only 2 base categories exist — Abaya and Modest Dress (jalabiyas are within Modest Dresses, not a separate collection).
- Q: Should the Gender enum be retained, removed, or hardcoded? → A: Remove entirely (Option B). All products are implicitly women's; baseCategory replaces Gender as the primary product axis. Gender enum, gender filter, and gender-based collection pages (e.g., /collections/men, /collections/women) will be removed across all three apps.
- Q: What is the URL route for occasion landing pages? → A: No dedicated occasion routes. Following byfatimaa.com's structure, occasions are used as a filter dimension within existing collection pages and product pages — not as separate landing pages. FR-013 revised accordingly.
- Q: Which FashionAttributes fields are required vs optional? → A: Partial required (Option A) — fabric, fitType, sleeveStyle, transparencyLayer, embellishment are required (embellishment defaults to NONE). Neckline and length are optional.
- Q: Should ProductOccasion keep the position field? → A: Keep position (Option B) — enables CMS operators to curate product ordering within each occasion context for editorial-style presentation matching byfatimaa.com's curated collection sections.

## Assumptions

- The platform is women-focused; the Gender enum (MEN/WOMEN/UNISEX) is removed entirely. baseCategory (ABAYA/MODEST_DRESS) replaces Gender as the primary product axis. Gender-based collection pages and filters are removed across all apps.
- Existing product data referencing Material/Stone/Clarity will be migrated by removing those references. No data transformation to fashion attributes is attempted — new fashion attributes must be populated manually via CMS.
- Occasion values are predefined (Eid, Wedding, Evening, Casual, Daily Elegance) but the system allows adding new occasions via CMS.
- Fashion attribute enum values (fabric types, sleeve styles, etc.) are predefined but extensible via schema migration — not via free-text input.
- The existing Collection model (hierarchical, with banner/image) is sufficient for this phase. Collection filter configurations are a future enhancement.
- ProductCustomField (tailoring fields) remains unchanged — it serves a different purpose (custom measurements) from FashionAttributes (structured fashion metadata).
- The existing ProductOption/ProductOptionValue system for variant generation (size/color matrices) remains unchanged.
- Analytics events will be extended with fashion-specific event types (occasion.view, fabric.filter) as a separate enhancement — not in this feature scope.
