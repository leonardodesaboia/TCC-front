import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { clientIntegration } from '@/lib/integrations/client';
import type { GetServicesParamsDto } from '@/types/service';

export function useServices(params: GetServicesParamsDto = {}) {
  return useQuery({
    queryKey: queryKeys.services.list(params),
    queryFn: () => clientIntegration.services.getAll(params),
  });
}

export function useService(id: string) {
  return useQuery({
    queryKey: queryKeys.services.detail(id),
    queryFn: () => clientIntegration.services.getById(id),
    enabled: !!id,
  });
}
