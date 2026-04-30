import { useQuery } from '@tanstack/react-query';
import { queryKeys } from '@/lib/constants/query-keys';
import { clientIntegration } from '@/lib/integrations/client';
import type {
  GetProfessionalsByCategoryParamsDto,
  SearchProfessionalsParamsDto,
} from '@/types/professional';

function normalize(value?: string) {
  return value?.trim().toLowerCase() ?? '';
}

export function useSearchProfessionals(params: SearchProfessionalsParamsDto) {
  return useQuery({
    queryKey: queryKeys.professionals.search(params),
    queryFn: () => clientIntegration.professionals.search(params),
  });
}

export function useProfessionalsByCategory(
  categoryId?: string,
  areaId?: string,
  categoryName?: string,
  params: GetProfessionalsByCategoryParamsDto = {},
) {
  return useQuery({
    queryKey: queryKeys.professionals.byCategory(categoryId, areaId, { categoryName, ...params }),
    queryFn: async () => {
      if (!areaId && !categoryId && !categoryName) return [];

      const professionals = await clientIntegration.professionals.search({
        areaId,
        professionId: categoryId,
        page: params.page,
        limit: params.limit,
      });
      const normalizedCategoryId = normalize(categoryId);
      const normalizedCategoryName = normalize(categoryName);

      if (!normalizedCategoryId && !normalizedCategoryName) {
        return professionals;
      }

      return professionals.filter((professional) => {
        const matchesProfessionId = professional.professions.some(
          (profession) => normalize(profession.id) === normalizedCategoryId,
        );
        const matchesProfessionName = normalizedCategoryName
          ? normalize(professional.profession).includes(normalizedCategoryName) ||
            professional.professions.some((profession) =>
              normalize(profession.name).includes(normalizedCategoryName),
            )
          : false;
        const matchesSpecialty = normalizedCategoryName
          ? professional.specialties.some((specialty) =>
              normalize(specialty).includes(normalizedCategoryName),
            )
          : false;

        return matchesProfessionId || matchesProfessionName || matchesSpecialty;
      });
    },
    enabled: !!areaId || !!categoryId || !!categoryName,
  });
}

export function useProfessional(id: string) {
  return useQuery({
    queryKey: queryKeys.professionals.detail(id),
    queryFn: () => clientIntegration.professionals.getById(id),
    enabled: !!id,
  });
}
