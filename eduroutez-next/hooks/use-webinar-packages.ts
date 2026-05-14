import { useQuery, useMutation, useQueryClient } from '@tanstack/react-query';
import axiosInstance from '@/lib/axios';

// Get all webinar packages
export const useWebinarPackages = (page = 1, limit = 10) => {
  return useQuery({
    queryKey: ['webinar-packages', page, limit],
    queryFn: async () => {
      const response = await axiosInstance.get('/webinar-packages', {
        params: { page, limit }
      });
      return response.data.data;
    }
  });
};

// Get active webinar packages
export const useActiveWebinarPackages = () => {
  return useQuery({
    queryKey: ['active-webinar-packages'],
    queryFn: async () => {
      const response = await axiosInstance.get('/webinar-packages/active');
      return response.data.data;
    }
  });
};

// Get single package
export const useWebinarPackage = (id: string) => {
  return useQuery({
    queryKey: ['webinar-package', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/webinar-package/${id}`);
      return response.data.data;
    },
    enabled: !!id
  });
};

// Create package
export const useCreateWebinarPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => axiosInstance.post('/webinar-package', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webinar-packages'] });
    }
  });
};

// Update package
export const useUpdateWebinarPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ id, data }: { id: string; data: any }) =>
      axiosInstance.patch(`/webinar-package/${id}`, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webinar-packages'] });
    }
  });
};

// Delete package
export const useDeleteWebinarPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (id: string) => axiosInstance.delete(`/webinar-package/${id}`),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['webinar-packages'] });
    }
  });
};

// Purchase package
export const usePurchaseWebinarPackage = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (data: any) => axiosInstance.post('/webinar-package/purchase', data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-purchases'] });
    }
  });
};

// Get my purchases
export const useMyWebinarPurchases = (page = 1, limit = 10, onlyActive = false) => {
  return useQuery({
    queryKey: ['my-purchases', page, limit, onlyActive],
    queryFn: async () => {
      const response = await axiosInstance.get('/my-webinar-purchases', {
        params: { page, limit, onlyActive }
      });
      return response.data.data;
    }
  });
};

// Get purchase details
export const useWebinarPurchaseDetails = (id: string) => {
  return useQuery({
    queryKey: ['webinar-purchase', id],
    queryFn: async () => {
      const response = await axiosInstance.get(`/webinar-purchase/${id}`);
      return response.data.data;
    },
    enabled: !!id
  });
};

// Confirm payment
export const useConfirmPayment = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ purchaseId, transactionId }: { purchaseId: string; transactionId: string }) =>
      axiosInstance.post(`/webinar-purchase/${purchaseId}/confirm-payment`, { transactionId }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-purchases'] });
    }
  });
};

// Use webinar
export const useUseWebinar = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ purchaseId, count = 1 }: { purchaseId: string; count?: number }) =>
      axiosInstance.post(`/webinar-purchase/${purchaseId}/use-webinar`, { count }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['my-purchases'] });
    }
  });
};

// Check availability
export const useCheckWebinarAvailability = () => {
  return useMutation({
    mutationFn: (packageId: string) =>
      axiosInstance.post('/webinar-purchase/check-availability', { packageId })
  });
};

// Get all purchases (admin)
export const useAllWebinarPurchases = (page = 1, limit = 10, filters = {}) => {
  return useQuery({
    queryKey: ['all-purchases', page, limit, filters],
    queryFn: async () => {
      const response = await axiosInstance.get('/webinar-purchases', {
        params: { page, limit, filters: JSON.stringify(filters) }
      });
      return response.data.data;
    }
  });
};

// Get purchase statistics (admin)
export const useWebinarPurchaseStats = () => {
  return useQuery({
    queryKey: ['webinar-stats'],
    queryFn: async () => {
      const response = await axiosInstance.get('/webinar-purchases/stats');
      return response.data.data;
    }
  });
};
