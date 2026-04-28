import { apiClient } from './client';
import { toNumber, unwrapItem, unwrapList } from './utils';
import type { ApiResponse } from '@/types/api';
import { USE_MOCKS_ENABLED } from '@/lib/constants/config';
import { mockDisputesApi } from '@/lib/mocks/runtime';
import type {
  AddTextEvidenceRequest,
  Dispute,
  DisputeDto,
  DisputeEvidence,
  DisputeEvidenceDto,
  OpenDisputeRequest,
} from '@/types/dispute';

function mapDispute(dto: DisputeDto): Dispute {
  return {
    id: dto.id,
    orderId: dto.orderId,
    openedBy: dto.openedBy,
    reason: dto.reason,
    status: dto.status,
    resolution: dto.resolution ?? undefined,
    clientRefundAmount: dto.clientRefundAmount != null ? toNumber(dto.clientRefundAmount) : undefined,
    professionalAmount: dto.professionalAmount != null ? toNumber(dto.professionalAmount) : undefined,
    resolvedBy: dto.resolvedBy ?? undefined,
    resolvedAt: dto.resolvedAt ?? undefined,
    openedAt: dto.openedAt,
    adminNotes: dto.adminNotes ?? undefined,
  };
}

function mapEvidence(dto: DisputeEvidenceDto): DisputeEvidence {
  return {
    id: dto.id,
    disputeId: dto.disputeId,
    senderId: dto.senderId,
    evidenceType: dto.evidenceType,
    content: dto.content ?? undefined,
    file: dto.file ?? null,
    sentAt: dto.sentAt,
  };
}

export const disputesApi = {
  async getByOrderId(orderId: string): Promise<Dispute> {
    if (USE_MOCKS_ENABLED) {
      return mockDisputesApi.getByOrderId(orderId);
    }

    const response = await apiClient.get<ApiResponse<DisputeDto> | DisputeDto>(
      `/api/v1/orders/${orderId}/disputes`,
    );
    return mapDispute(unwrapItem(response.data));
  },

  async open(orderId: string, payload: OpenDisputeRequest): Promise<Dispute> {
    if (USE_MOCKS_ENABLED) {
      return mockDisputesApi.open(orderId, payload);
    }

    const response = await apiClient.post<ApiResponse<DisputeDto> | DisputeDto>(
      `/api/v1/orders/${orderId}/disputes`,
      payload,
    );
    return mapDispute(unwrapItem(response.data));
  },

  async getEvidences(disputeId: string): Promise<DisputeEvidence[]> {
    if (USE_MOCKS_ENABLED) {
      return mockDisputesApi.getEvidences(disputeId);
    }

    const response = await apiClient.get<ApiResponse<DisputeEvidenceDto[]> | DisputeEvidenceDto[]>(
      `/api/v1/disputes/${disputeId}/evidences`,
    );
    return unwrapList<DisputeEvidenceDto>(response.data).map(mapEvidence);
  },

  async addTextEvidence(disputeId: string, payload: AddTextEvidenceRequest): Promise<DisputeEvidence> {
    if (USE_MOCKS_ENABLED) {
      return mockDisputesApi.addTextEvidence(disputeId, payload);
    }

    const response = await apiClient.post<ApiResponse<DisputeEvidenceDto> | DisputeEvidenceDto>(
      `/api/v1/disputes/${disputeId}/evidences`,
      payload,
    );
    return mapEvidence(unwrapItem(response.data));
  },
};
