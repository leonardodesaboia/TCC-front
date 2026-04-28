import { apiClient } from './client';
import { toNumber, unwrapList } from './utils';
import type { ApiResponse, SpringPage } from '@/types/api';
import type { CreateReviewRequest, ReviewSummary, ReviewSummaryDto } from '@/types/review';

function mapReview(dto: ReviewSummaryDto): ReviewSummary {
  return {
    id: dto.id,
    orderId: dto.orderId,
    reviewerId: dto.reviewerId,
    revieweeId: dto.revieweeId,
    rating: toNumber(dto.rating),
    comment: dto.comment ?? undefined,
    submittedAt: dto.submittedAt,
    publishedAt: dto.publishedAt ?? undefined,
  };
}

export const reviewsApi = {
  async getOrderReviews(orderId: string): Promise<ReviewSummary[]> {
    const response = await apiClient.get<ApiResponse<ReviewSummaryDto[]> | ReviewSummaryDto[]>(
      `/api/v1/orders/${orderId}/reviews`,
    );

    return unwrapList<ReviewSummaryDto>(response.data).map(mapReview);
  },

  async getProfessionalReviews(professionalId: string): Promise<ReviewSummary[]> {
    const response = await apiClient.get<SpringPage<ReviewSummaryDto> | ApiResponse<ReviewSummaryDto[]> | ReviewSummaryDto[]>(
      `/api/v1/professionals/${professionalId}/reviews`,
      { params: { size: 20 } },
    );

    return unwrapList<ReviewSummaryDto>(response.data).map(mapReview);
  },

  async createOrderReview(orderId: string, payload: CreateReviewRequest): Promise<ReviewSummary> {
    const response = await apiClient.post<ApiResponse<ReviewSummaryDto> | ReviewSummaryDto>(
      `/api/v1/orders/${orderId}/reviews`,
      payload,
    );

    const dto = 'data' in response.data ? response.data.data : response.data;
    return mapReview(dto);
  },
};
