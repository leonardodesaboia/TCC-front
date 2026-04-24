export interface Address {
  id: string;
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault: boolean;
  reference?: string;
}

export interface AddressDto {
  id: string;
  street: string;
  number: string;
  complement?: string | null;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  isDefault?: boolean | null;
  reference?: string | null;
}

export interface CreateAddressRequestDto {
  street: string;
  number: string;
  complement?: string;
  neighborhood: string;
  city: string;
  state: string;
  zipCode: string;
  reference?: string;
  isDefault?: boolean;
}

export interface UpdateAddressRequestDto extends Partial<CreateAddressRequestDto> {}
