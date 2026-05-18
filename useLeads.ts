import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import { leadsApi } from '../api';
import { LeadFilters, LeadFormData } from '../types';
import toast from 'react-hot-toast';

export const LEADS_KEY = 'leads';

export function useLeads(filters: LeadFilters) {
  return useQuery({
    queryKey: [LEADS_KEY, filters],
    queryFn: () => leadsApi.getAll(filters).then((r) => r.data),
    placeholderData: (prev) => prev,
  });
}

export function useLead(id: string) {
  return useQuery({
    queryKey: [LEADS_KEY, id],
    queryFn: () => leadsApi.getOne(id).then((r) => r.data.data),
    enabled: !!id,
  });
}

export function useCreateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (data: LeadFormData) => leadsApi.create(data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LEADS_KEY] });
      toast.success('Lead created!');
    },
    onError: () => toast.error('Failed to create lead'),
  });
}

export function useUpdateLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: Partial<LeadFormData> }) =>
      leadsApi.update(id, data).then((r) => r.data.data),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LEADS_KEY] });
      toast.success('Lead updated!');
    },
    onError: () => toast.error('Failed to update lead'),
  });
}

export function useDeleteLead() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => leadsApi.delete(id),
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: [LEADS_KEY] });
      toast.success('Lead deleted');
    },
    onError: () => toast.error('Failed to delete lead'),
  });
}
