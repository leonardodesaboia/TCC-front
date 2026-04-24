import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { clientIntegration } from '@/lib/integrations/client';
import type { SearchProfessionalsParamsDto } from '@/types/professional';

export function useSearchProfessionals(params: SearchProfessionalsParamsDto) {
  return useQuery({
    queryKey: queryKeys.professionals.search(params),
    queryFn: () => clientIntegration.professionals.search(params),
  });
}

export function useProfessional(id: string) {
  return useQuery({
    queryKey: queryKeys.professionals.detail(id),
    queryFn: () => clientIntegration.professionals.getById(id),
    enabled: !!id,
  });
}
