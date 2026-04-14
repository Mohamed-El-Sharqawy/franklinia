// Shoppable Video types
export interface ShoppableVideo {
  id: string;
  videoUrl: string;
  videoPublicId: string;
  thumbnailUrl: string;
  thumbnailPublicId: string;
  productId: string;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    nameEn: string;
    nameAr: string;
    slug: string;
    variants: Array<{
      id: string;
      nameEn: string;
      nameAr: string;
      price: number;
      compareAtPrice?: number | null;
      images: Array<{
        id: string;
        position: number;
        image: {
          id: string;
          url: string;
          altEn?: string | null;
          altAr?: string | null;
        };
      }>;
    }>;
  };
}

// Customer Review types
export interface Review {
  id: string;
  productId: string;
  userId?: string | null;
  customerName: string;
  title: string;
  content: string;
  rating: number;
  isApproved: boolean;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  product?: {
    id: string;
    nameEn: string;
    nameAr: string;
    slug: string;
    variants?: Array<{
      id: string;
      price: number;
      compareAtPrice?: number | null;
      images?: Array<{
        id: string;
        position: number;
        image?: {
          id: string;
          url: string;
        };
      }>;
    }>;
  };
  user?: {
    id: string;
    firstName: string;
    lastName: string;
  } | null;
}

// Homepage Hero Banner types (carousel)
export interface Banner {
  id: string;
  titleEn: string;
  titleAr: string;
  subtitleEn?: string | null;
  subtitleAr?: string | null;
  buttonTextEn?: string | null;
  buttonTextAr?: string | null;
  imageUrl: string;
  publicId: string;
  linkUrl?: string | null;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Instagram Post types (Franklinia - FW25 Drops gallery)
export interface InstagramPost {
  id: string;
  imageUrl: string;
  publicId: string;
  linkUrl?: string | null;
  altEn?: string | null;
  altAr?: string | null;
  position: number;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}

// Dynamic Pages (About, Size Guide, etc.)
export interface Page {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  metaTitleEn?: string | null;
  metaTitleAr?: string | null;
  metaDescriptionEn?: string | null;
  metaDescriptionAr?: string | null;
  isActive: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
}

// Legal Policies (Shipping, Privacy, etc.)
export interface Policy {
  id: string;
  slug: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
}
