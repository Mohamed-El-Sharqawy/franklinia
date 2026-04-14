import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchFormSubmissions } from "./queries";
import { 
  updateFormSubmissionStatus, 
  deleteFormSubmission, 
  type UpdateFormSubmissionStatusBody 
} from "./mutations";

export const formSubmissionKeys = {
  all: ["form-submissions"] as const,
  lists: () => [...formSubmissionKeys.all, "list"] as const,
  list: (params?: Record<string, string>) => [...formSubmissionKeys.lists(), params] as const,
};

export function useFormSubmissions(params?: Record<string, string>) {
  return useQuery({
    queryKey: formSubmissionKeys.list(params),
    queryFn: () => fetchFormSubmissions(params),
  });
}

export function useUpdateFormSubmissionStatus() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateFormSubmissionStatusBody }) => 
      updateFormSubmissionStatus(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formSubmissionKeys.all });
    },
  });
}

export function useDeleteFormSubmission() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deleteFormSubmission(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: formSubmissionKeys.all });
    },
  });
}
