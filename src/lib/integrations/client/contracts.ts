import type { CreateAddressRequestDto, UpdateAddressRequestDto, Address } from '@/types/address';
import type {
  CreateOnDemandOrderRequestDto,
  CreateOrderRequestDto,
  ExpressProposal,
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
  getByProfessional(professionalId: string): Promise<ServiceSummary[]>;
  getByProfessionalAndId(professionalId: string, serviceId: string): Promise<ServiceDetails>;
}

export interface ClientOrdersIntegration {
  getMyOrders(params?: OrderFiltersDto): Promise<OrderSummary[]>;
  getById(id: string): Promise<OrderDetails>;
  getExpressProposals(id: string): Promise<ExpressProposal[]>;
  create(payload: CreateOrderRequestDto): Promise<OrderDetails>;
  createOnDemand(payload: CreateOnDemandOrderRequestDto): Promise<OrderDetails>;
  chooseProposal: (orderId: string, professionalId: string) => Promise<OrderDetails>;
  cancel: (orderId: string, reason: string) => Promise<OrderDetails>;
  confirm: (orderId: string) => Promise<OrderDetails>;
  uploadPhoto: (orderId: string, formData: FormData) => Promise<void>;
}

export interface ClientAddressesIntegration {
  getAll(): Promise<Address[]>;
  create(payload: CreateAddressRequestDto): Promise<Address>;
  update(id: string, payload: UpdateAddressRequestDto): Promise<Address>;
  remove(id: string): Promise<void>;
  setDefault(id: string): Promise<Address>;
}

export interface ClientIntegration {
  professionals: ClientProfessionalsIntegration;
  services: ClientServicesIntegration;
  orders: ClientOrdersIntegration;
  addresses: ClientAddressesIntegration;
}
