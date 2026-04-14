import { Collection } from "./category";
import { BaseCategory, FitAdjustment, Fabric, FitType } from "./fashion-enums";
import type { FashionAttributes } from "./fashion-attributes";
import type { ProductOccasion } from "./occasion";

export enum ProductBadge {
  NEW = "NEW",
  BESTSELLER = "BESTSELLER",
  LIMITED_EDITION = "LIMITED_EDITION",
}

export interface Color {
  id: string;
  nameEn: string;
  nameAr: string;
  hex: string;
}

export interface Size {
  id: string;
  nameEn: string;
  nameAr: string;
  position: number;
}

export interface ProductOption {
  id: string;
  nameEn: string;
  nameAr: string;
  position: number;
  productId: string;
  values: ProductOptionValue[];
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductOptionValue {
  id: string;
  valueEn: string;
  valueAr: string;
  hex?: string | null;
  position: number;
  optionId: string;
  createdAt: Date;
  updatedAt: Date;
}

export enum CustomFieldType {
  TEXT = "TEXT",
  TEXTAREA = "TEXTAREA",
  NUMBER = "NUMBER",
  FILE = "FILE",
}

export interface ProductCustomField {
  id: string;
  type: CustomFieldType;
  labelEn: string;
  labelAr: string;
  placeholderEn?: string | null;
  placeholderAr?: string | null;
  isRequired: boolean;
  productId: string;
  createdAt: Date;
  updatedAt: Date;
}

// Product-level image (the actual file stored in Cloudinary)
export interface ProductImage {
  id: string;
  productId: string;
  url: string;
  publicId: string;
  altEn?: string | null;
  altAr?: string | null;
  createdAt: Date;
}

// Junction table: links images to variants with position
export interface ProductVariantImage {
  id: string;
  imageId: string;
  variantId: string;
  position: number;
  image?: ProductImage; // Included when fetching variant images
}

// Flattened image for frontend convenience (combines ProductImage + position)
export interface VariantImageWithDetails {
  id: string; // ProductVariantImage id
  imageId: string;
  url: string;
  publicId: string;
  altEn?: string | null;
  altAr?: string | null;
  position: number;
}

export interface ProductVariant {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  sku?: string | null;
  price: number;
  compareAtPrice?: number | null;
  stock: number;
  fitAdjustment?: FitAdjustment | null;
  isActive: boolean;
  metaTitleEn?: string | null;
  metaTitleAr?: string | null;
  metaDescriptionEn?: string | null;
  metaDescriptionAr?: string | null;
  images: VariantImageWithDetails[]; // Flattened images with position
  optionValues: ProductOptionValue[]; // Multi-axis selection
  createdAt: Date;
  updatedAt: Date;
}

export interface Product {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string;
  descriptionAr: string;
  shortDescriptionEn?: string | null;
  shortDescriptionAr?: string | null;
  metaTitleEn?: string | null;
  metaTitleAr?: string | null;
  metaDescriptionEn?: string | null;
  metaDescriptionAr?: string | null;
  baseCategory: BaseCategory;
  isActive: boolean;
  isFeatured: boolean;
  badge?: ProductBadge | null;
  isTrending: boolean;
  position: number;
  collectionId?: string | null;
  fashionAttributes?: FashionAttributes | null;
  occasions?: ProductOccasion[];
  sizeGuideUrl?: string | null;
  defaultVariantId?: string | null;
  defaultVariant?: ProductVariant | null;
  hoverVariantId?: string | null;
  hoverVariant?: ProductVariant | null;
  variants: ProductVariant[];
  options: ProductOption[];
  customFields: ProductCustomField[];
  images: ProductImage[]; // Product-level images that can be shared across variants
  createdAt: Date;
  updatedAt: Date;
  collection: Collection;
}

export interface ProductFilters {
  fabric?: Fabric;
  occasion?: string;
  fitType?: FitType;
  baseCategory?: BaseCategory;
  collectionId?: string;
  minPrice?: number;
  maxPrice?: number;
  isActive?: boolean;
  isFeatured?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}
