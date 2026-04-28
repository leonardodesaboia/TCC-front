import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { professionalManagementApi } from '@/lib/api/professional-management';
import { getApiErrorMessage } from '@/lib/utils/errors';
import { toast } from '@/lib/utils/toast';
import type {
  AssignSubscriptionPlanRequest,
  CreateBlockedPeriodRequest,
  CreateProfessionalOfferingRequest,
  CreateProfessionalRequest,
  UpdateGeoRequest,
  UpdateProfessionalOfferingRequest,
  UpdateProfessionalRequest,
  VerifyProfessionalRequest,
} from '@/types/professional-management';

export function useProfessionalDocuments(professionalId: string) {
  return useQuery({
    queryKey: ['professionals', professionalId, 'documents'],
    queryFn: () => professionalManagementApi.getDocuments(professionalId),
    enabled: !!professionalId,
  });
}

export function useUploadProfessionalDocument(professionalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (formData: FormData) => professionalManagementApi.uploadDocument(professionalId, formData),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals', professionalId, 'documents'] });
      toast.success('Documento enviado.');
    },
    onError: (error: unknown) => toast.error('Erro ao enviar documento', getApiErrorMessage(error)),
  });
}

export function useCreateProfessionalProfile() {
  return useMutation({
    mutationFn: (payload: CreateProfessionalRequest) => professionalManagementApi.createProfile(payload),
    onSuccess: () => toast.success('Perfil profissional criado.'),
    onError: (error: unknown) => toast.error('Erro ao criar perfil profissional', getApiErrorMessage(error)),
  });
}

export function useUpdateProfessionalProfile(professionalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfessionalRequest) =>
      professionalManagementApi.updateProfile(professionalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals', professionalId] });
      toast.success('Perfil profissional atualizado.');
    },
    onError: (error: unknown) => toast.error('Erro ao atualizar perfil profissional', getApiErrorMessage(error)),
  });
}

export function useUpdateProfessionalGeo(professionalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateGeoRequest) =>
      professionalManagementApi.updateGeo(professionalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals', professionalId] });
      toast.success('Geolocalização atualizada.');
    },
    onError: (error: unknown) => toast.error('Erro ao atualizar geolocalização', getApiErrorMessage(error)),
  });
}

export function useVerifyProfessional(professionalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: VerifyProfessionalRequest) =>
      professionalManagementApi.verify(professionalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals', professionalId] });
      toast.success('Status de verificação atualizado.');
    },
    onError: (error: unknown) => toast.error('Erro ao verificar profissional', getApiErrorMessage(error)),
  });
}

export function useSubscriptionPlans() {
  return useQuery({
    queryKey: ['subscription-plans'],
    queryFn: () => professionalManagementApi.getSubscriptionPlans(),
  });
}

export function useProfessionalSubscription(professionalId: string) {
  return useQuery({
    queryKey: ['professionals', professionalId, 'subscription'],
    queryFn: () => professionalManagementApi.getProfessionalSubscription(professionalId),
    enabled: !!professionalId,
  });
}

export function useAssignProfessionalSubscription(professionalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: AssignSubscriptionPlanRequest) =>
      professionalManagementApi.assignProfessionalSubscription(professionalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals', professionalId, 'subscription'] });
      toast.success('Assinatura atualizada.');
    },
    onError: (error: unknown) => toast.error('Erro ao atualizar assinatura', getApiErrorMessage(error)),
  });
}

export function useCancelProfessionalSubscription(professionalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: () => professionalManagementApi.cancelProfessionalSubscription(professionalId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals', professionalId, 'subscription'] });
      toast.success('Assinatura cancelada.');
    },
    onError: (error: unknown) => toast.error('Erro ao cancelar assinatura', getApiErrorMessage(error)),
  });
}

export function useProfessionalCalendarBlocks(professionalId: string) {
  return useQuery({
    queryKey: ['professionals', professionalId, 'calendar-blocks'],
    queryFn: () => professionalManagementApi.getCalendarBlocks(professionalId),
    enabled: !!professionalId,
  });
}

export function useCreateProfessionalCalendarBlock(professionalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateBlockedPeriodRequest) =>
      professionalManagementApi.createCalendarBlock(professionalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals', professionalId, 'calendar-blocks'] });
      toast.success('Bloqueio criado.');
    },
    onError: (error: unknown) => toast.error('Erro ao criar bloqueio', getApiErrorMessage(error)),
  });
}

export function useDeleteProfessionalCalendarBlock(professionalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (blockId: string) => professionalManagementApi.deleteCalendarBlock(professionalId, blockId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals', professionalId, 'calendar-blocks'] });
      toast.success('Bloqueio removido.');
    },
    onError: (error: unknown) => toast.error('Erro ao remover bloqueio', getApiErrorMessage(error)),
  });
}

export function useProfessionalOfferings(professionalId: string) {
  return useQuery({
    queryKey: ['professionals', professionalId, 'offerings'],
    queryFn: () => professionalManagementApi.getOfferings(professionalId),
    enabled: !!professionalId,
  });
}

export function useCreateProfessionalOffering(professionalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: CreateProfessionalOfferingRequest) =>
      professionalManagementApi.createOffering(professionalId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals', professionalId, 'offerings'] });
      toast.success('Serviço cadastrado.');
    },
    onError: (error: unknown) => toast.error('Erro ao cadastrar serviço', getApiErrorMessage(error)),
  });
}

export function useUpdateProfessionalOffering(professionalId: string, offeringId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (payload: UpdateProfessionalOfferingRequest) =>
      professionalManagementApi.updateOffering(professionalId, offeringId, payload),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals', professionalId, 'offerings'] });
      toast.success('Serviço atualizado.');
    },
    onError: (error: unknown) => toast.error('Erro ao atualizar serviço', getApiErrorMessage(error)),
  });
}

export function useDeleteProfessionalOffering(professionalId: string) {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: (offeringId: string) => professionalManagementApi.deleteOffering(professionalId, offeringId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ['professionals', professionalId, 'offerings'] });
      toast.success('Serviço removido.');
    },
    onError: (error: unknown) => toast.error('Erro ao remover serviço', getApiErrorMessage(error)),
  });
}
