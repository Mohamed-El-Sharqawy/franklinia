import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import { fetchPages, fetchPage, fetchPolicies, fetchPolicy } from "./queries";
import {
  createPage,
  updatePage,
  deletePage,
  createPolicy,
  updatePolicy,
  deletePolicy,
  type CreatePageBody,
  type UpdatePageBody,
  type CreatePolicyBody,
  type UpdatePolicyBody,
} from "./mutations";

export const staticPageKeys = {
  all: ["static-pages"] as const,
  pages: () => [...staticPageKeys.all, "pages"] as const,
  page: (slug: string) => [...staticPageKeys.pages(), slug] as const,
  policies: () => [...staticPageKeys.all, "policies"] as const,
  policy: (slug: string) => [...staticPageKeys.policies(), slug] as const,
};

// --- Page Hooks ---

export function usePages() {
  return useQuery({
    queryKey: staticPageKeys.pages(),
    queryFn: fetchPages,
  });
}

export function usePage(slug: string) {
  return useQuery({
    queryKey: staticPageKeys.page(slug),
    queryFn: () => fetchPage(slug),
    enabled: !!slug,
  });
}

export function useCreatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePageBody) => createPage(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staticPageKeys.pages() });
    },
  });
}

export function useUpdatePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePageBody }) => 
      updatePage(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staticPageKeys.pages() });
    },
  });
}

export function useDeletePage() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePage(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staticPageKeys.pages() });
    },
  });
}

// --- Policy Hooks ---

export function usePolicies() {
  return useQuery({
    queryKey: staticPageKeys.policies(),
    queryFn: fetchPolicies,
  });
}

export function usePolicy(slug: string) {
  return useQuery({
    queryKey: staticPageKeys.policy(slug),
    queryFn: () => fetchPolicy(slug),
    enabled: !!slug,
  });
}

export function useCreatePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (body: CreatePolicyBody) => createPolicy(body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staticPageKeys.policies() });
    },
  });
}

export function useUpdatePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, body }: { id: string; body: UpdatePolicyBody }) => 
      updatePolicy(id, body),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staticPageKeys.policies() });
    },
  });
}

export function useDeletePolicy() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => deletePolicy(id),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: staticPageKeys.policies() });
    },
  });
}
