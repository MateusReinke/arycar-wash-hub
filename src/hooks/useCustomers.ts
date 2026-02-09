import { useQuery } from '@tanstack/react-query';
import api from '@/services/api';
import type { Customer, Vehicle } from '@/types';

export function useCustomerByPhone(phone: string) {
  return useQuery<Customer[]>({
    queryKey: ['customers', phone],
    queryFn: async () => {
      const { data } = await api.get('/customers', { params: { phone } });
      return data;
    },
    enabled: phone.length >= 10,
  });
}

export function useCustomerVehicles(customerId: string) {
  return useQuery<Vehicle[]>({
    queryKey: ['customer-vehicles', customerId],
    queryFn: async () => {
      const { data } = await api.get(`/customers/${customerId}/vehicles`);
      return data;
    },
    enabled: !!customerId,
  });
}
