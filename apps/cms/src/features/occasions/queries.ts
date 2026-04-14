import { api } from "@/lib/api";
import type { ApiResponse } from "@ecommerce/shared-types";

export interface Occasion {
  id: string;
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  isActive: boolean;
  position: number;
  createdAt: string;
  updatedAt: string;
  _count?: { products: number };
}

export function fetchOccasions(params?: Record<string, string>) {
  return api.get<ApiResponse<Occasion[]>>("/api/occasions", params);
}

export function fetchOccasion(id: string) {
  return api.get<ApiResponse<Occasion>>(`/api/occasions/${id}`);
}
