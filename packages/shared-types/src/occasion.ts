export interface Occasion {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn: string | null;
  descriptionAr: string | null;
  isActive: boolean;
  position: number;
  createdAt: Date;
  updatedAt: Date;
}

export interface ProductOccasion {
  id: string;
  productId: string;
  occasionId: string;
  position: number;
  occasion?: Occasion;
  createdAt: Date;
}

export interface CreateOccasionInput {
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  isActive?: boolean;
  position?: number;
}

export type UpdateOccasionInput = Partial<CreateOccasionInput>;
