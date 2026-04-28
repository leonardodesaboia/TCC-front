import type { StorageRef } from './api';

export type DisputeStatus = 'open' | 'under_review' | 'resolved';
export type DisputeResolution = 'refund_full' | 'refund_partial' | 'release_to_pro';
export type EvidenceType = 'text' | 'photo';

export interface Dispute {
  id: string;
  orderId: string;
  openedBy: string;
  reason: string;
  status: DisputeStatus;
  resolution?: DisputeResolution;
  clientRefundAmount?: number;
  professionalAmount?: number;
  resolvedBy?: string;
  resolvedAt?: string;
  openedAt: string;
  adminNotes?: string;
}

export interface DisputeDto {
  id: string;
  orderId: string;
  openedBy: string;
  reason: string;
  status: DisputeStatus;
  resolution?: DisputeResolution | null;
  clientRefundAmount?: number | string | null;
  professionalAmount?: number | string | null;
  resolvedBy?: string | null;
  resolvedAt?: string | null;
  openedAt: string;
  adminNotes?: string | null;
}

export interface OpenDisputeRequest {
  reason: string;
}

export interface DisputeEvidence {
  id: string;
  disputeId: string;
  senderId: string;
  evidenceType: EvidenceType;
  content?: string;
  file?: StorageRef | null;
  sentAt: string;
}

export interface DisputeEvidenceDto {
  id: string;
  disputeId: string;
  senderId: string;
  evidenceType: EvidenceType;
  content?: string | null;
  file?: StorageRef | null;
  sentAt: string;
}

export interface AddTextEvidenceRequest {
  content: string;
}
