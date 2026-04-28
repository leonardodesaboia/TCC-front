import { useQuery } from '@tanstack/react-query';
import { useMutation, useQueryClient } from '@tanstack/react-query';
import { catalogApi } from '@/lib/api/catalog';
import { queryKeys } from '@/lib/constants/query-keys';
import { USE_MOCKS_ENABLED } from '@/lib/constants/config';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { toast } from '@/lib/utils/toast';
import type { ServiceArea, ServiceCategory } from '@/types/catalog';

const MOCK_SERVICE_AREAS: ServiceArea[] = [
  { id: 'area-1', name: 'Elétrica', active: true },
  { id: 'area-2', name: 'Limpeza', active: true },
  { id: 'area-3', name: 'Hidráulica', active: true },
  { id: 'area-4', name: 'Pintura', active: true },
  { id: 'area-5', name: 'Manutenção', active: true },
  { id: 'area-6', name: 'Reforma', active: true },
  { id: 'area-7', name: 'Cuidados', active: true },
];

const MOCK_SERVICE_CATEGORIES: ServiceCategory[] = [
  { id: 'cat-1', areaId: 'area-1', name: 'Eletricista', active: true },
  { id: 'cat-2', areaId: 'area-1', name: 'Instalação de tomada', active: true },
  { id: 'cat-3', areaId: 'area-1', name: 'Troca de disjuntor', active: true },
  { id: 'cat-4', areaId: 'area-2', name: 'Faxina residencial', active: true },
  { id: 'cat-5', areaId: 'area-2', name: 'Limpeza pós-obra', active: true },
  { id: 'cat-6', areaId: 'area-2', name: 'Limpeza comercial', active: true },
  { id: 'cat-7', areaId: 'area-3', name: 'Encanador', active: true },
  { id: 'cat-8', areaId: 'area-3', name: 'Desentupimento', active: true },
  { id: 'cat-9', areaId: 'area-3', name: 'Instalação de torneira', active: true },
  { id: 'cat-10', areaId: 'area-4', name: 'Pintura interna', active: true },
  { id: 'cat-11', areaId: 'area-4', name: 'Pintura externa', active: true },
  { id: 'cat-12', areaId: 'area-4', name: 'Textura e efeitos', active: true },
  { id: 'cat-13', areaId: 'area-5', name: 'Manutenção geral', active: true },
  { id: 'cat-14', areaId: 'area-5', name: 'Montagem de móveis', active: true },
  { id: 'cat-15', areaId: 'area-5', name: 'Reparos domésticos', active: true },
  { id: 'cat-16', areaId: 'area-6', name: 'Pedreiro', active: true },
  { id: 'cat-17', areaId: 'area-6', name: 'Gesseiro', active: true },
  { id: 'cat-18', areaId: 'area-6', name: 'Azulejista', active: true },
  { id: 'cat-19', areaId: 'area-7', name: 'Cuidador de idosos', active: true },
  { id: 'cat-20', areaId: 'area-7', name: 'Babá', active: true },
  { id: 'cat-21', areaId: 'area-7', name: 'Pet sitter', active: true },
];

export function useServiceAreas() {
  return useQuery({
    queryKey: queryKeys.areas.all,
    queryFn: () => (USE_MOCKS_ENABLED ? Promise.resolve(MOCK_SERVICE_AREAS) : catalogApi.getAreas()),
  });
}

export function useServiceCategories(areaId?: string) {
  return useQuery({
    queryKey: queryKeys.categories.list(areaId),
    queryFn: () =>
      USE_MOCKS_ENABLED
        ? Promise.resolve(
            areaId
              ? MOCK_SERVICE_CATEGORIES.filter((category) => category.areaId === areaId)
              : MOCK_SERVICE_CATEGORIES,
          )
        : catalogApi.getCategories(areaId),
  });
}

export function useCreateServiceArea() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { name: string }) => catalogApi.createArea(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.areas.all });
      toast.success('Área de serviço criada.');
    },
    onError: (error: unknown) => toast.error('Erro ao criar área', getApiErrorMessage(error)),
  });
}

export function useCreateServiceCategory() {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: { areaId: string; name: string }) => catalogApi.createCategory(payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.categories.all });
      toast.success('Categoria criada.');
    },
    onError: (error: unknown) => toast.error('Erro ao criar categoria', getApiErrorMessage(error)),
  });
}
