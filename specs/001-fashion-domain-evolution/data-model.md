# Data Model: Fashion Domain Evolution

**Branch**: `001-fashion-domain-evolution` | **Date**: 2026-04-14

## Enum Definitions

### BaseCategory

```prisma
enum BaseCategory {
  ABAYA
  MODEST_DRESS
}
```

- Jalabiyas are categorized under MODEST_DRESS
- Extension requires schema migration

### FitAdjustment

```prisma
enum FitAdjustment {
  LOOSE
  RELAXED
  STRUCTURED
}
```

### Fabric

```prisma
enum Fabric {
  CHIFFON
  CREPE
  SATIN
  LACE
  JERSEY
  NIDHA
  LINEN
  VELVET
  ORGANZA
  GEORGETTE
}
```

### Embellishment

```prisma
enum Embellishment {
  EMBROIDERY
  BEADS
  LACE_OVERLAY
  CRYSTAL
  SEQUINS
  NONE
}
```

- NONE is the default value — represents unembellished garments

### SleeveStyle

```prisma
enum SleeveStyle {
  CAPE
  KIMONO
  FLARED
  FITTED
  BELL
  BATWING
}
```

### Neckline

```prisma
enum Neckline {
  ROUND
  V_NECK
  BOAT
  STAND_COLLAR
  HOODED
  OPEN_FRONT
}
```

- Optional field on FashionAttributes

### FitType

```prisma
enum FitType {
  FLOWY
  RELAXED
  STRUCTURED
  A_LINE
}
```

### GarmentLength

```prisma
enum GarmentLength {
  FULL_LENGTH
  MIDI
  KNEE_LENGTH
}
```

- Optional field on FashionAttributes
- Named GarmentLength (not Length) to avoid SQL keyword conflict

### TransparencyLayer

```prisma
enum TransparencyLayer {
  INNER
  OUTER
  CLOSED
}
```

- INNER: garment worn under another (inner dress)
- OUTER: garment worn over another (open abaya, requires inner layer)
- CLOSED: garment is fully closed, no layering needed

## New Entities

### FashionAttributes

```prisma
model FashionAttributes {
  id        String   @id @default(cuid())
  productId String   @unique
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  // Required fields
  fabric             Fabric
  embellishment      Embellishment @default(NONE)
  sleeveStyle        SleeveStyle
  fitType            FitType
  transparencyLayer  TransparencyLayer

  // Optional fields
  neckline           Neckline?
  length             GarmentLength?

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([fabric])
  @@index([sleeveStyle])
  @@index([fitType])
  @@index([transparencyLayer])
  @@map("fashion_attributes")
}
```

**Validation rules**:
- fabric, sleeveStyle, fitType, transparencyLayer: MUST NOT be null (enforced by schema)
- embellishment: MUST NOT be null (defaults to NONE)
- neckline, length: MAY be null (optional)
- Every active Product MUST have a FashionAttributes record (enforced at application layer)

### Occasion

```prisma
model Occasion {
  id   String @id @default(cuid())
  slug String @unique

  nameEn       String
  nameAr       String
  descriptionEn String? @db.Text
  descriptionAr String? @db.Text

  isActive Boolean @default(true)
  position Int     @default(0)

  products ProductOccasion[]

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
  @@index([isActive])
  @@index([position])
  @@map("occasions")
}
```

**Validation rules**:
- slug: MUST be unique, URL-safe, lowercase
- nameEn/nameAr: MUST NOT be empty
- Predefined occasions: Eid, Wedding, Evening, Casual, Daily Elegance

### ProductOccasion

```prisma
model ProductOccasion {
  id         String    @id @default(cuid())
  productId  String
  occasionId String
  position   Int       @default(0)

  product   Product   @relation(fields: [productId], references: [id], onDelete: Cascade)
  occasion  Occasion  @relation(fields: [occasionId], references: [id], onDelete: Cascade)

  createdAt DateTime @default(now())

  @@unique([productId, occasionId])
  @@index([productId])
  @@index([occasionId])
  @@index([position])
  @@map("product_occasions")
}
```

**Validation rules**:
- Each product-occasion pair MUST be unique
- position: used for editorial curation ordering within occasion context
- A product MUST have at least one ProductOccasion record to be active

## Modified Entities

### Product (Modified)

```prisma
model Product {
  id   String @id @default(cuid())
  slug String @unique

  nameEn       String
  nameAr       String
  descriptionEn String? @db.Text
  descriptionAr String? @db.Text

  // CHANGED: Gender enum removed, replaced with baseCategory
  baseCategory BaseCategory

  price    Float
  salePrice Float?

  badge       Badge?

  // REMOVED: materialId, stoneId, clarityId (jewellery attributes)
  // REMOVED: gender (Gender enum)

  collectionId String?
  collection   Collection? @relation(fields: [collectionId], references: [id], onDelete: SetNull)

  // NEW: Fashion attributes (1:1)
  fashionAttributes FashionAttributes?

  // NEW: Occasion associations (N:N)
  occasions ProductOccasion[]

  options    ProductOption[]
  variants   ProductVariant[]
  images     ProductImage[]
  customFields ProductCustomField[]
  reviews    Review[]

  isActive   Boolean @default(true)
  position   Int     @default(0)

  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([slug])
  @@index([baseCategory])
  @@index([isActive])
  @@index([collectionId])
  @@map("products")
}
```

**Changes summary**:
- ADDED: `baseCategory BaseCategory` (replaces Gender)
- ADDED: `fashionAttributes FashionAttributes?` (1:1 relation — nullable during creation, MUST be non-null for active products)
- ADDED: `occasions ProductOccasion[]` (N:N relation)
- REMOVED: `materialId String?` + `material Material?`
- REMOVED: `stoneId String?` + `stone Stone?`
- REMOVED: `clarityId String?` + `clarity Clarity?`
- REMOVED: `gender Gender`
- REMOVED: `Gender` enum (MEN/WOMEN/UNISEX)

### ProductVariant (Modified)

```prisma
model ProductVariant {
  id        String   @id @default(cuid())
  productId String
  product   Product  @relation(fields: [productId], references: [id], onDelete: Cascade)

  sku       String   @unique
  price     Float
  salePrice Float?
  stock     Int      @default(0)

  // NEW: Fit adjustment for modest sizing
  fitAdjustment FitAdjustment?

  optionValues ProductOptionValue[]
  images       ProductVariantImage[]

  isActive  Boolean  @default(true)
  createdAt DateTime @default(now())
  updatedAt DateTime @updatedAt

  @@index([productId])
  @@index([sku])
  @@index([isActive])
  @@map("product_variants")
}
```

**Changes summary**:
- ADDED: `fitAdjustment FitAdjustment?` (optional — not all variants need fit metadata)

### attribute.prisma (Modified)

The following models are REMOVED:
- `Material` — jewellery-specific, no fashion equivalent
- `Stone` — jewellery-specific, no fashion equivalent
- `Clarity` — jewellery-specific, no fashion equivalent

The following models are KEPT unchanged:
- `ProductOption` — generic option system (Size, Color, etc.)
- `ProductOptionValue` — generic option value system

## Removed Entities

| Entity | Reason | Migration Action |
|--------|--------|-----------------|
| Material | Jewellery-specific, replaced by FashionAttributes.fabric | Drop table, remove FK from Product |
| Stone | Jewellery-specific, no fashion equivalent | Drop table, remove FK from Product |
| Clarity | Jewellery-specific, no fashion equivalent | Drop table, remove FK from Product |
| Gender enum | Replaced by BaseCategory; all products are women's | Drop enum, remove column from Product |

## Entity Relationship Summary

```text
Product (1) ──── (1) FashionAttributes
Product (N) ──── (N) Occasion  [via ProductOccasion]
Product (N) ──── (1) Collection  [unchanged]
Product (1) ──── (N) ProductVariant  [unchanged + fitAdjustment]
Product (1) ──── (N) ProductOption  [unchanged]
Product (1) ──── (N) ProductImage  [unchanged]
Product (1) ──── (N) Review  [unchanged]
Product (1) ──── (N) ProductCustomField  [unchanged]

Occasion (1) ──── (N) ProductOccasion
Collection (1) ──── (N) Product  [unchanged, hierarchical]
```

## Validation Rules (Application Layer)

| Rule | Enforcement Point |
|------|-------------------|
| Active product MUST have FashionAttributes | Backend service (before `isActive = true`) |
| Active product MUST have ≥1 Occasion | Backend service (before `isActive = true`) |
| FashionAttributes required fields non-null | Prisma schema (non-nullable) + Zod validation |
| baseCategory MUST be ABAYA or MODEST_DRESS | Prisma enum constraint |
| Occasion slug MUST be unique | Prisma @@unique |
| ProductOccasion pair MUST be unique | Prisma @@unique |
| embellishment defaults to NONE | Prisma @default(NONE) |
| transparencyLayer CLOSED for abayas by default | CMS form logic (not schema — allows override) |
