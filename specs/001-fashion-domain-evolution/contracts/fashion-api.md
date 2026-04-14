# Fashion API Contracts

**Branch**: `001-fashion-domain-evolution` | **Date**: 2026-04-14

## Backend API Endpoints

### Occasions Module

#### GET /api/occasions

List all active occasions.

**Response** `200`:

```json
[
  {
    "id": "clx...",
    "slug": "eid",
    "nameEn": "Eid",
    "nameAr": "عيد",
    "descriptionEn": "Eid collection...",
    "descriptionAr": "تشكيلات عيد...",
    "isActive": true,
    "position": 0
  }
]
```

#### POST /api/occasions

Create a new occasion. **CMS only.**

**Request**:

```json
{
  "slug": "wedding",
  "nameEn": "Wedding",
  "nameAr": "فرح",
  "descriptionEn": "Wedding collection...",
  "descriptionAr": "تشكيلات فرح...",
  "isActive": true,
  "position": 1
}
```

**Response** `201`: Occasion object

#### PATCH /api/occasions/:id

Update an occasion. **CMS only.**

**Request**: Partial occasion fields

**Response** `200`: Updated occasion object

#### DELETE /api/occasions/:id

Delete an occasion. **CMS only.** Fails if any active products are associated.

**Response** `204` | `409` (has associated products)

---

### FashionAttributes (Managed via Product endpoints)

FashionAttributes are created/updated as part of product creation and editing — they have no standalone CRUD endpoints. They are embedded in product request/response payloads.

---

### Products Module (Modified)

#### GET /api/products/:slug

**Response** `200` (additions marked with ★):

```json
{
  "id": "clx...",
  "slug": "amethyst-geometric-link-abaya",
  "nameEn": "The Amethyst Geometric Link Abaya",
  "nameAr": "...",
  "descriptionEn": "...",
  "descriptionAr": "...",
  "baseCategory": "ABAYA",           // ★ NEW (replaces gender)
  "price": 550,
  "salePrice": null,
  "badge": "NEW",
  "isActive": true,
  "fashionAttributes": {              // ★ NEW
    "fabric": "NIDHA",
    "embellishment": "EMBROIDERY",
    "sleeveStyle": "CAPE",
    "fitType": "FLOWY",
    "transparencyLayer": "CLOSED",
    "neckline": "ROUND",
    "length": "FULL_LENGTH"
  },
  "occasions": [                      // ★ NEW
    { "id": "clx...", "slug": "eid", "nameEn": "Eid", "nameAr": "عيد", "position": 0 },
    { "id": "clx...", "slug": "evening", "nameEn": "Evening", "nameAr": "سهره", "position": 1 }
  ],
  "collection": { "id": "...", "slug": "abayas", "nameEn": "Abayas" },
  "variants": [
    {
      "id": "clx...",
      "sku": "AMETH-ABAYA-52",
      "price": 550,
      "stock": 100,
      "fitAdjustment": "LOOSE",        // ★ NEW
      "optionValues": [...],
      "images": [...]
    }
  ],
  "images": [...],
  "options": [...],
  "customFields": [...],
  "reviews": [...]
}
```

#### POST /api/products

Create a new product. **CMS only.**

**Request** (additions marked with ★):

```json
{
  "slug": "amethyst-geometric-link-abaya",
  "nameEn": "The Amethyst Geometric Link Abaya",
  "nameAr": "...",
  "descriptionEn": "...",
  "descriptionAr": "...",
  "baseCategory": "ABAYA",              // ★ NEW (required)
  "price": 550,
  "salePrice": null,
  "badge": "NEW",
  "collectionId": "clx...",
  "fashionAttributes": {                // ★ NEW (required for isActive=true)
    "fabric": "NIDHA",                 // required
    "embellishment": "EMBROIDERY",     // required, defaults to NONE
    "sleeveStyle": "CAPE",             // required
    "fitType": "FLOWY",                // required
    "transparencyLayer": "CLOSED",     // required
    "neckline": "ROUND",               // optional
    "length": "FULL_LENGTH"            // optional
  },
  "occasionIds": ["clx_eid", "clx_evening"],  // ★ NEW (required for isActive=true, ≥1)
  "occasionPositions": {                      // ★ NEW (optional)
    "clx_eid": 0,
    "clx_evening": 1
  },
  "options": [...],
  "variants": [
    {
      "sku": "AMETH-ABAYA-52",
      "price": 550,
      "stock": 100,
      "fitAdjustment": "LOOSE",        // ★ NEW (optional)
      "optionValueIds": [...]
    }
  ],
  "images": [...],
  "customFields": [...],
  "isActive": true
}
```

**Validation errors**:

| Condition | Error |
|-----------|-------|
| `isActive=true` without `fashionAttributes` | `400: Fashion attributes required for active products` |
| `isActive=true` with incomplete fashion attributes (missing fabric, sleeveStyle, fitType, transparencyLayer) | `400: Required fashion attribute fields missing: [list]` |
| `isActive=true` with empty `occasionIds` | `400: At least one occasion required for active products` |
| Invalid enum value in fashionAttributes | `400: Invalid {field} value: {value}` |
| Invalid `baseCategory` value | `400: Invalid baseCategory value: {value}` |

#### PATCH /api/products/:id

Update a product. **CMS only.** Same validation rules as POST apply when setting `isActive=true`.

---

### Collections Module (Modified)

#### GET /api/collections/:slug/products

**Query parameters** (additions marked with ★):

| Parameter | Type | Description |
|-----------|------|-------------|
| `page` | int | Page number (default 1) |
| `limit` | int | Items per page (default 12) |
| `sort` | string | Sort field (position, price_asc, price_desc, newest) |
| `priceMin` | float | Minimum price filter |
| `priceMax` | float | Maximum price filter |
| `isAvailable` | bool | Availability filter |
| `fabric` | string | ★ Fabric enum value filter |
| `occasion` | string | ★ Occasion slug filter |
| `fitType` | string | ★ FitType enum value filter |
| `sleeveStyle` | string | ★ SleeveStyle enum value filter |

**Response** `200` (additions marked with ★):

```json
{
  "products": [
    {
      "id": "clx...",
      "slug": "amethyst-geometric-link-abaya",
      "nameEn": "The Amethyst Geometric Link Abaya",
      "nameAr": "...",
      "baseCategory": "ABAYA",           // ★
      "price": 550,
      "salePrice": null,
      "badge": "NEW",
      "fashionAttributes": {              // ★ Summary for cards
        "fabric": "NIDHA",
        "fitType": "FLOWY",
        "sleeveStyle": "CAPE"
      },
      "occasions": [                      // ★ For badges
        { "slug": "eid", "nameEn": "Eid", "nameAr": "عيد" }
      ],
      "images": [{ "url": "...", "altEn": "..." }],
      "isActive": true
    }
  ],
  "total": 42,
  "page": 1,
  "limit": 12,
  "availableFilters": {                  // ★ NEW: Dynamic filter options for current collection
    "fabrics": ["NIDHA", "CREPE", "LACE"],
    "occasions": ["eid", "evening", "wedding"],
    "fitTypes": ["FLOWY", "RELAXED"],
    "sleeveStyles": ["CAPE", "KIMONO"]
  }
}
```

**Filter logic**:
- `fabric`: Joins through `fashionAttributes` relation, filters where `FashionAttributes.fabric = value`
- `occasion`: Joins through `occasions` relation → `ProductOccasion` → `Occasion`, filters where `Occasion.slug = value`
- `fitType`: Joins through `fashionAttributes` relation, filters where `FashionAttributes.fitType = value`
- `sleeveStyle`: Joins through `fashionAttributes` relation, filters where `FashionAttributes.sleeveStyle = value`
- Multiple filters are AND-combined

---

### Search (Modified)

#### GET /api/search

**Query parameters** (additions marked with ★):

| Parameter | Type | Description |
|-----------|------|-------------|
| `q` | string | Free-text search (product name) |
| `fabric` | string | ★ Fabric enum value |
| `occasion` | string | ★ Occasion slug |
| `fitType` | string | ★ FitType enum value |
| `baseCategory` | string | ★ ABAYA or MODEST_DRESS |

**Response** `200`: Same shape as collection products response, plus `availableFilters`.
