import { api } from "@/lib/api";
import type { ApiResponse, FormSubmission } from "@ecommerce/shared-types";

export interface UpdateFormSubmissionStatusBody {
  status: "PENDING" | "REVIEWED" | "RESOLVED" | "SPAM";
  adminNotes?: string;
}

export function updateFormSubmissionStatus(id: string, body: UpdateFormSubmissionStatusBody) {
  return api.patch<ApiResponse<FormSubmission>>(`/api/forms/${id}/status`, body);
}

export function deleteFormSubmission(id: string) {
  return api.delete<ApiResponse<{ message: string }>>(`/api/forms/${id}`);
}
