export interface FormSubmission {
  id: string;
  type: "CONTACT" | "NEWSLETTER" | "CUSTOM_ORDER";
  payload: any;
  status: "PENDING" | "REVIEWED" | "RESOLVED" | "SPAM";
  adminNotes?: string | null;
  userId?: string | null;
  createdAt: string;
  updatedAt: string;
}

export interface CreateFormSubmissionBody {
  type: string;
  payload: any;
  userId?: string;
}

export interface UpdateFormSubmissionStatusBody {
  status: string;
  adminNotes?: string;
}
