import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import api from '@/services/api';
import type { WorkOrder, CreateWorkOrderPayload, StatusTransitionPayload } from '@/types';

export function useWorkOrders(params?: { status?: string; search?: string }) {
  return useQuery<WorkOrder[]>({
    queryKey: ['work-orders', params],
    queryFn: async () => {
      const { data } = await api.get('/work-orders', { params });
      return data;
    },
  });
}

export function useWorkOrder(id: string) {
  return useQuery<WorkOrder>({
    queryKey: ['work-order', id],
    queryFn: async () => {
      const { data } = await api.get(`/work-orders/${id}`);
      return data;
    },
    enabled: !!id,
  });
}

export function useCreateWorkOrder() {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: CreateWorkOrderPayload) => {
      const { data } = await api.post('/work-orders', payload);
      return data as WorkOrder;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-orders'] }),
  });
}

export function useUpdateStatus(id: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (payload: StatusTransitionPayload) => {
      const { data } = await api.patch(`/work-orders/${id}/status`, payload);
      return data as WorkOrder;
    },
    onSuccess: () => {
      qc.invalidateQueries({ queryKey: ['work-orders'] });
      qc.invalidateQueries({ queryKey: ['work-order', id] });
    },
  });
}

export function useUploadMedia(workOrderId: string) {
  const qc = useQueryClient();
  return useMutation({
    mutationFn: async (formData: FormData) => {
      const { data } = await api.post(`/work-orders/${workOrderId}/media`, formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      });
      return data;
    },
    onSuccess: () => qc.invalidateQueries({ queryKey: ['work-order', workOrderId] }),
  });
}
