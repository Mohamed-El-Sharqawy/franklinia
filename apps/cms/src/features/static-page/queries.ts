import { api } from "@/lib/api";
import type { Page, Policy } from "@ecommerce/shared-types";
import type { ApiResponse } from "@ecommerce/shared-types";

// --- Pages ---
export function fetchPages() {
  return api.get<ApiResponse<Page[]>>("/api/static/pages");
}

export function fetchPage(slug: string) {
  return api.get<ApiResponse<Page>>(`/api/static/pages/${slug}`);
}

// --- Policies ---
export function fetchPolicies() {
  return api.get<ApiResponse<Policy[]>>("/api/static/policies");
}

export function fetchPolicy(slug: string) {
  return api.get<ApiResponse<Policy>>(`/api/static/policies/${slug}`);
}
