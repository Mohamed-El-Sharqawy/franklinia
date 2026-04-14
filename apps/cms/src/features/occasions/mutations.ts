import { api } from "@/lib/api";
import type { ApiResponse } from "@ecommerce/shared-types";
import type { Occasion } from "./queries";

export interface CreateOccasionBody {
  slug: string;
  nameEn: string;
  nameAr: string;
  descriptionEn?: string;
  descriptionAr?: string;
  isActive?: boolean;
  position?: number;
}

export interface UpdateOccasionBody {
  slug?: string;
  nameEn?: string;
  nameAr?: string;
  descriptionEn?: string | null;
  descriptionAr?: string | null;
  isActive?: boolean;
  position?: number;
}

export function createOccasion(body: CreateOccasionBody) {
  return api.post<ApiResponse<Occasion>>("/api/occasions", body);
}

export function updateOccasion(id: string, body: UpdateOccasionBody) {
  return api.patch<ApiResponse<Occasion>>(`/api/occasions/${id}`, body);
}

export function deleteOccasion(id: string) {
  return api.delete<ApiResponse<true>>(`/api/occasions/${id}`);
}
