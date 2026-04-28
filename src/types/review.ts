export interface ReviewSummary {
  id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number;
  comment?: string;
  submittedAt: string;
  publishedAt?: string;
}

export interface ReviewSummaryDto {
  id: string;
  orderId: string;
  reviewerId: string;
  revieweeId: string;
  rating: number | string;
  comment?: string | null;
  submittedAt: string;
  publishedAt?: string | null;
}

export interface CreateReviewRequest {
  rating: number;
  comment?: string;
}
