import type { CreateAddressRequestDto, UpdateAddressRequestDto, Address } from '@/types/address';
import type {
  CreateOrderRequestDto,
  OrderDetails,
  OrderFiltersDto,
  OrderSummary,
} from '@/types/order';
import type {
  GetProfessionalsByCategoryParamsDto,
  ProfessionalProfile,
  ProfessionalSummary,
  SearchProfessionalsParamsDto,
} from '@/types/professional';
import type { GetServicesParamsDto, ServiceDetails, ServiceSummary } from '@/types/service';

export interface ClientProfessionalsIntegration {
  search(params?: SearchProfessionalsParamsDto): Promise<ProfessionalSummary[]>;
  getById(id: string): Promise<ProfessionalProfile>;
  getByProfession(
    professionId: string,
    params?: GetProfessionalsByCategoryParamsDto,
  ): Promise<ProfessionalSummary[]>;
  getByArea(
    areaId: string,
    params?: GetProfessionalsByCategoryParamsDto,
  ): Promise<ProfessionalSummary[]>;
}

export interface ClientServicesIntegration {
  getAll(params?: GetServicesParamsDto): Promise<ServiceSummary[]>;
  getById(id: string): Promise<ServiceDetails>;
}

export interface ClientOrdersIntegration {
  getMyOrders(params?: OrderFiltersDto): Promise<OrderSummary[]>;
  getById(id: string): Promise<OrderDetails>;
  create(payload: CreateOrderRequestDto): Promise<OrderDetails>;
}

export interface ClientAddressesIntegration {
  getAll(): Promise<Address[]>;
  create(payload: CreateAddressRequestDto): Promise<Address>;
  update(id: string, payload: UpdateAddressRequestDto): Promise<Address>;
}

export interface ClientIntegration {
  professionals: ClientProfessionalsIntegration;
  services: ClientServicesIntegration;
  orders: ClientOrdersIntegration;
  addresses: ClientAddressesIntegration;
}
