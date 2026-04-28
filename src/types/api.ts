export interface ApiResponse<T> {
  data: T;
  message?: string;
  success?: boolean;
}

export interface SpringPage<T> {
  content: T[];
  totalElements: number;
  totalPages: number;
  size: number;
  number: number;
  numberOfElements: number;
  first: boolean;
  last: boolean;
  empty: boolean;
}

export interface StorageRef {
  key: string;
  downloadUrl: string;
  urlExpiresAt?: string | null;
}

export interface ApiErrorResponse {
  status: number;
  message: string | string[];
  error?: string;
  fields?: Record<string, string>;
  timestamp?: string;
  scheduledDeletionAt?: string;
}
