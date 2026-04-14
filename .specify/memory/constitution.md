<!--
SYNC IMPACT REPORT
==================
Version change: 1.0.0 → 2.0.0
Modified principles:
  - III. Jewellery Brand Protocols → III. Modest Fashion Domain
    Protocols (backward-incompatible domain redefinition)
  - IV. Media & Search → VI. Media & Search (renumbered)
  - V. Structural Cleanliness & Code Reuse → VII. Structural
    Cleanliness & Code Reuse (renumbered)
Added sections:
  - IV. Fashion-First Data Architecture (new principle)
  - V. Occasion-Driven Discovery (new principle)
  - Modest Fit & Layering Logic (domain constraint subsection)
  - Product Narrative & Content Separation (domain constraint
    subsection)
Removed sections:
  - None (Jewellery Brand Protocols redefined, not removed)
Templates requiring updates:
  ✅ .specify/templates/plan-template.md (Constitution Check
    section updated to reflect principles III–VII)
  ✅ .specify/templates/spec-template.md (no structural changes
    needed — spec template is domain-agnostic)
  ✅ .specify/templates/tasks-template.md (no changes needed —
    path conventions unchanged)
  ✅ .specify/templates/checklist-template.md (no changes needed)
  ✅ .specify/templates/agent-file-template.md (no changes needed)
Follow-up TODOs: None
-->

# Franklinia Constitution

## Core Principles

### I. Architectural Purity

The monorepo workspace boundary is strictly enforced:
- All deployable applications MUST reside within `apps/` (Backend,
  CMS, Marketing).
- All cross-app shared logic MUST reside within `packages/`:
  - `packages/shared-types/` for TypeScript interfaces, enums, and
    Zod schemas.
  - `packages/shared-utils/` for utility functions, constants, and
    validation helpers.
- No direct relative imports between apps are permitted.
- Cross-app dependency MUST flow exclusively through workspace
  packages using the `workspace:*` protocol.

**Rationale**: Prevents coupling between subsystems, ensures type
safety across the monorepo, and enforces a single source of truth
for shared contracts.

### II. Sub-System Consistency

Each subsystem MUST follow its prescribed modular pattern
consistently:

- **Backend (ElysiaJS)**: Features MUST be organized as
  `src/modules/[feature]` with each module providing routes,
  services, and a consistent API structure. Prisma MUST be used for
  all database access. Every module MUST expose Swagger-documented
  endpoints.
- **Frontend (Next.js / React)**: The Marketing app and CMS MUST
  maintain structural parity. Any UI component used in both apps
  MUST be extracted to a shared UI library package. Component naming,
  file structure, and state management patterns MUST be consistent
  across frontend apps.

**Rationale**: Consistency reduces cognitive load, simplifies
onboarding, and prevents divergent patterns that complicate
maintenance.

### III. Modest Fashion Domain Protocols

This is NOT a generic e-commerce system. It is a modest fashion
platform where products are structured fashion objects, not generic
SKUs. The following domain constraints are non-negotiable:

- **Currency**: The system is locked to AED (United Arab Emirates
  Dirham). Multi-currency support MUST NOT be implemented unless
  explicitly requested by the product owner.
- **Localization**: All user-facing content, titles, descriptions,
  and error messages MUST support Arabic (AR) and English (EN)
  translations. Frontend applications MUST handle RTL (right-to-left)
  layout for Arabic natively and elegantly. No placeholder or stub
  translations are permitted in production.
- **Payment**: Stripe standard business account integration ONLY.
  Stripe Connect, multi-vendor, or marketplace payment logic MUST
  NOT be introduced.
- **Base Categories**: Products MUST belong to one of the defined
  base categories: Abaya or Modest Dress. Jalabiyas are categorized
  under Modest Dress, not as a separate base category. New categories
  (e.g., Kaftan, Hijab) MAY be added only through explicit schema
  extension — never as untyped free-text fields.
- **Fashion Attributes Are Core Data**: Fabric, embellishment,
  sleeve style, neckline, fit type, length, and transparency layer
  are NOT optional metadata — they are mandatory structured
  attributes that drive filtering, discovery, and product logic.
  Every product MUST carry a complete FashionAttributes record.
- **Occasion Is a First-Class Entity**: Occasions (Eid, Wedding,
  Evening, Casual, Daily Elegance) MUST be modeled as a dedicated
  entity with N:N relationships to products. Occasion MUST NOT be
  stored as a flat tag or free-text field.

**Rationale**: A modest fashion system derives its value from
structured fashion intelligence. Treating attributes and occasions
as second-class data produces a generic store that cannot support
occasion-driven browsing, fabric-based filtering, or style-driven
discovery — the core shopping patterns of this domain.

### IV. Fashion-First Data Architecture

Products are structured fashion objects, not generic inventory
items. The data model MUST reflect this at every layer:

- **FashionAttributes Entity**: MUST exist as a distinct entity
  (1:1 with Product, either embedded or separate table) containing:
  fabric, embellishment, sleeveStyle, neckline, fitType, length,
  transparencyLayer (inner/outer). These fields MUST be typed as
  enums or constrained sets — never free-text strings.
- **Product-Occasion Relationship**: Products MUST relate to
  Occasions via an explicit join entity (N:N). Occasion filtering
  MUST be queryable at the database level, not computed at the
  application layer.
- **Collections as Merchandising Layers**: Collections (e.g.,
  "Abayas", "Evening Collection") are NOT simple categories — they
  are curated, filterable entry points to discovery. Collection
  entities MUST support filter configurations (price range,
  availability, fabric, occasion).
- **Variant / Size with Modest Fit Logic**: Size variants MUST
  include fitAdjustment metadata (loose, relaxed, structured)
  alongside standard size labels. Layering compatibility (open
  abaya vs. closed, inner dress requirement) MUST be modeled on
  the variant or product level.
- **No Flat Product Blobs**: Product fields that represent fashion
  semantics (fabric, fit, sleeve) MUST NOT be stored as flat
  columns on the Product table. They MUST be normalized into
  FashionAttributes. Generic unstructured fields on Product are
  prohibited.
- **Separation of Narrative from Structure**: Product description
  (rich storytelling text) and structured fashion attributes MUST
  be stored separately. Narrative content MUST NOT be used to
  encode filterable data; structured attributes MUST NOT contain
  prose.

**Rationale**: Fashion browsing depends on structured, filterable
attributes. Flat product models produce unqueryable data and force
client-side filtering — unacceptable at scale. Separation of
narrative from structure ensures both luxury storytelling and
precise filtering coexist without corruption.

### V. Occasion-Driven Discovery

Shopping in modest fashion is occasion-driven, not SKU-driven.
The system MUST model and expose this behavior:

- **Occasion Entity**: MUST exist as a first-class entity with
  name, slug, and description. Predefined occasions include: Eid,
  Wedding, Evening, Casual, Daily Elegance. New occasions MAY be
  added via schema extension.
- **Occasion-Based Filtering**: Collection and search endpoints
  MUST support occasion as a primary filter dimension, equal in
  weight to price and category.
- **Occasion Suggestions on Products**: Product detail responses
  MUST include associated occasions, enabling frontend occasion
  badges and cross-linking.
- **Occasion-Based Collection Views**: The system MUST support
  occasion-based filtering within collection pages (e.g., filter
  by "Eid" on the Abayas collection). Occasion is a primary filter
  dimension equal in weight to price and category — not a
  tag-filtered afterthought.
- **Browsing Priority**: Style, occasion, fabric feel, and visual
  silhouette MUST take priority over SKU-based or ID-based
  navigation in API design and frontend routing.

**Rationale**: Modest fashion customers browse by context (what
occasion am I dressing for?) before they browse by category.
Ignoring occasion as a core navigation dimension produces a
generic catalog experience that fails the domain.

### VI. Media & Search

- **Media Management**: All images and videos MUST be uploaded,
  transformed, and served via Cloudinary. Local file storage for
  media assets is prohibited. All media URLs in the database and
  API responses MUST reference Cloudinary.
- **Search**: The platform MUST implement premium, predictive
  search overlays on the Marketing frontend. Search MUST support
  fashion-aware queries (by fabric, occasion, style, silhouette)
  in addition to product name search. Search analytics (query
  terms, result counts, click-through rates) MUST be tracked and
  stored in the backend for analysis.

**Rationale**: Centralized media management ensures consistent
delivery, transformation, and caching. Fashion-aware search
drives discovery in a domain where customers search by feel and
occasion, not by product code.

### VII. Structural Cleanliness & Code Reuse

Structural cleanliness and code reuse take priority over rapid,
messy implementation:

- If a TypeScript type, interface, or Zod schema is needed in
  more than one app, it MUST be moved to `packages/shared-types/`
  immediately.
- If a utility function, constant, or validation helper is needed
  in more than one app, it MUST be moved to `packages/shared-utils/`
  immediately.
- No duplication of business logic across apps. Shared logic MUST
  be extracted to the appropriate package.
- Every PR MUST be reviewed for extraction opportunities before
  merge.

**Rationale**: Duplication creates divergence. Early extraction
prevents technical debt accumulation and ensures consistency across
the platform.

## Domain Constraints

**Technology Stack**:
- Runtime: Bun (backend), Node.js (frontend apps)
- Backend Framework: ElysiaJS
- Frontend Frameworks: Next.js 15 (Marketing), React + Vite (CMS)
- Styling: Tailwind CSS v4 + Shadcn/ui across all frontend apps
- Database: PostgreSQL (Neon), accessed exclusively via Prisma 7
- Package Manager: pnpm with workspaces

**Fashion Domain Constraints**:
- Products MUST carry complete FashionAttributes (fabric,
  embellishment, sleeveStyle, neckline, fitType, length,
  transparencyLayer). Incomplete fashion attribute records are
  a validation error, not a warning.
- Products MUST be associated with at least one Occasion.
- Base categories are constrained to: Abaya, Modest Dress.
  Jalabiyas fall under Modest Dress. Extension requires
  schema migration.
- Sizing MUST include fitAdjustment (loose / relaxed /
  structured) alongside standard size labels.
- Layering compatibility (open abaya, inner dress, outer
  garment) MUST be modeled explicitly.
- Product narrative (rich description) and structured
  attributes MUST be stored in separate fields/entities.

**Forbidden Patterns**:
- No multi-currency logic (AED only).
- No Stripe Connect / marketplace payment flows.
- No local media file storage (Cloudinary only).
- No direct inter-app imports bypassing `packages/`.
- No English-only content in production (AR/EN mandatory).
- No untyped `any` in shared packages.
- No flat fashion attributes on the Product entity
  (use FashionAttributes).
- No occasion stored as a free-text tag or label
  (use Occasion entity with N:N).
- No generic/unstructured product fields that encode
  fashion semantics without typing.
- No SKU-driven navigation as the primary browsing
  pattern (occasion/style/fabric first).

## Development Workflow

**Code Review Requirements**:
- Every PR MUST pass constitution compliance check.
- Reviewers MUST verify: types/utilities extracted to packages
  when used cross-app, no forbidden patterns introduced, AR/EN
  translations provided for all user-facing strings, fashion
  attributes are structured (not flat), occasions use the
  dedicated entity.
- Constitution violations MUST be flagged as blocking review
  comments.

**Quality Gates**:
- `pnpm build` MUST succeed across all workspaces before merge.
- Prisma migrations MUST be validated before merge.
- No untyped `any` in shared packages.
- Fashion attribute completeness MUST be enforced at the
  schema/validation layer.

**Branching & Commits**:
- Feature branches: `###-feature-name`
- Commit messages: conventional commits preferred.

## Governance

This constitution is the authoritative governance document for
the Franklinia monorepo. It supersedes all other practices,
conventions, and ad-hoc decisions.

**Amendment Procedure**:
1. Propose amendment with documented rationale.
2. Review impact on existing code and templates.
3. Update constitution with incremented version:
   - MAJOR: backward-incompatible principle removals or
     redefinitions.
   - MINOR: new principle/section added or materially expanded
     guidance.
   - PATCH: clarifications, wording, typo fixes, non-semantic
     refinements.
4. Propagate changes to all dependent templates and
   documentation.

**Compliance Review**:
- All PRs and reviews MUST verify compliance with this
  constitution.
- Complexity introduced without necessity MUST be justified in
  the PR description.
- Use `.specify/templates/` for feature planning workflow.

**Version**: 2.0.0 | **Ratified**: 2026-04-06 | **Last Amended**: 2026-04-14
