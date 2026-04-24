import type { ServiceDetails, ServiceSummary } from './service';

export interface ProfessionRef {
  id: string;
  name: string;
}

export interface AreaRef {
  id: string;
  name: string;
}

export interface ProfessionalSummary {
  id: string;
  name: string;
  avatarUrl?: string;
  profession: string;
  professions: ProfessionRef[];
  areas: AreaRef[];
  specialties: string[];
  neighborhood?: string;
  city?: string;
  rating: number;
  reviewCount: number;
  availabilityLabel?: string;
  badgeLabel?: string;
}

export interface ProfessionalProfile extends ProfessionalSummary {
  bio?: string;
  services: ServiceSummary[];
  yearsOfExperience?: number;
}

export interface ProfessionDto {
  id: string;
  name: string;
}

export interface AreaDto {
  id: string;
  name: string;
}

export interface ProfessionalSummaryDto {
  id: string;
  name: string;
  avatarUrl?: string | null;
  profession?: string | null;
  professions?: ProfessionDto[] | null;
  areas?: AreaDto[] | null;
  specialties?: string[] | null;
  neighborhood?: string | null;
  city?: string | null;
  rating?: number | string | null;
  reviewCount?: number | string | null;
  availabilityLabel?: string | null;
  badgeLabel?: string | null;
}

export interface ProfessionalProfileDto extends ProfessionalSummaryDto {
  bio?: string | null;
  services?: ServiceDetails[] | null;
  yearsOfExperience?: number | null;
}

export interface SearchProfessionalsParamsDto {
  query?: string;
  professionId?: string;
  areaId?: string;
  page?: number;
  limit?: number;
}

export interface GetProfessionalsByCategoryParamsDto {
  page?: number;
  limit?: number;
}
