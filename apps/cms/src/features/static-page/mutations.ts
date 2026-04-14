import { api } from "@/lib/api";
import type { Page, Policy } from "@ecommerce/shared-types";
import type { ApiResponse } from "@ecommerce/shared-types";

// --- Page Mutations ---
export interface CreatePageBody {
  slug: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  metaTitleEn?: string;
  metaTitleAr?: string;
  metaDescriptionEn?: string;
  metaDescriptionAr?: string;
  isActive?: boolean;
  position?: number;
}

export interface UpdatePageBody extends Partial<CreatePageBody> {}

export function createPage(body: CreatePageBody) {
  return api.post<ApiResponse<Page>>("/api/static/pages", body);
}

export function updatePage(id: string, body: UpdatePageBody) {
  return api.patch<ApiResponse<Page>>(`/api/static/pages/${id}`, body);
}

export function deletePage(id: string) {
  return api.delete<ApiResponse<{ message: string }>>(`/api/static/pages/${id}`);
}

// --- Policy Mutations ---
export interface CreatePolicyBody {
  slug: string;
  titleEn: string;
  titleAr: string;
  contentEn: string;
  contentAr: string;
  isActive?: boolean;
}

export interface UpdatePolicyBody extends Partial<CreatePolicyBody> {}

export function createPolicy(body: CreatePolicyBody) {
  return api.post<ApiResponse<Policy>>("/api/static/policies", body);
}

export function updatePolicy(id: string, body: UpdatePolicyBody) {
  return api.patch<ApiResponse<Policy>>(`/api/static/policies/${id}`, body);
}

export function deletePolicy(id: string) {
  return api.delete<ApiResponse<{ message: string }>>(`/api/static/policies/${id}`);
}
