import { api } from "@/lib/api";
import type { FormSubmission, ApiResponse } from "@ecommerce/shared-types";

export function fetchFormSubmissions(params?: Record<string, string>) {
  return api.get<ApiResponse<{ data: FormSubmission[]; meta: any }>>("/api/forms", params);
}
