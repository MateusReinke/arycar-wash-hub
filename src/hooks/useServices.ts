import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import type { ServiceCatalog } from '@/types';

export function useServices() {
  return useQuery<ServiceCatalog[]>({
    queryKey: ['services'],
    queryFn: async () => {
      const { data } = await api.get('/services');
      return data;
    },
  });
}
