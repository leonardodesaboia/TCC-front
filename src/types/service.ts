export interface ServiceSummary {
  id: string;
  name: string;
  description: string;
  price: number;
  effectivePrice: number;
  durationInMinutes?: number;
  professionId?: string;
}

export interface ServiceDto {
  id: string;
  name: string;
  description?: string | null;
  price?: number | string | null;
  effectivePrice?: number | string | null;
  durationInMinutes?: number | null;
  professionId?: string | null;
}

export interface ServiceDetails extends ServiceSummary {
  requirements?: string[];
  includedItems?: string[];
}

export interface ServiceDetailsDto extends ServiceDto {
  requirements?: string[] | null;
  includedItems?: string[] | null;
}

export interface GetServicesParamsDto {
  query?: string;
  professionId?: string;
  areaId?: string;
}
