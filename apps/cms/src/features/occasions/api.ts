import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchOccasions, fetchOccasion } from "./queries";
import {
  createOccasion,
  updateOccasion,
  deleteOccasion,
  type CreateOccasionBody,
  type UpdateOccasionBody,
} from "./mutations";

export const occasionKeys = {
  all: ["occasions"] as const,
  lists: () => [...occasionKeys.all, "list"] as const,
  list: (params?: Record<string, string>) => [...occasionKeys.lists(), params] as const,
  details: () => [...occasionKeys.all, "detail"] as const,
  detail: (id: string) => [...occasionKeys.details(), id] as const,
};

export function useOccasions(params?: Record<string, string>) {
  return useQuery({
    queryKey: occasionKeys.list(params),
    queryFn: () => fetchOccasions(params),
  });
}

export function useOccasion(id: string) {
  return useQuery({
    queryKey: occasionKeys.detail(id),
    queryFn: () => fetchOccasion(id),
    enabled: !!id,
  });
}

export function useCreateOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (body: CreateOccasionBody) => createOccasion(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: occasionKeys.lists() });
    },
  });
}

export function useUpdateOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdateOccasionBody }) =>
      updateOccasion(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: occasionKeys.all });
    },
  });
}

export function useDeleteOccasion() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (id: string) => deleteOccasion(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: occasionKeys.lists() });
    },
  });
}
