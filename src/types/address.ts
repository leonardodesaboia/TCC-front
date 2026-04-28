export interface Address {
  id: string;
  userId: string;
  label: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  isDefault: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export interface AddressDto {
  id: string;
  userId: string;
  label: string;
  street: string;
  number: string;
  complement?: string | null;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number | string;
  lng: number | string;
  isDefault?: boolean | null;
  createdAt?: string | null;
  updatedAt?: string | null;
}

export interface CreateAddressRequestDto {
  label: string;
  street: string;
  number: string;
  complement?: string;
  district: string;
  city: string;
  state: string;
  zipCode: string;
  lat: number;
  lng: number;
  isDefault?: boolean;
}

export interface UpdateAddressRequestDto extends Partial<CreateAddressRequestDto> {}
