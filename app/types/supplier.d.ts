import type { PaginationMeta, PaginationParams } from "./pagination";
import type { User } from "./user";

export interface Supplier {
  id: string;
  user_id: string | null;
  business_name: string;
  contact_person: string;
  phone: string | null;
  email: string;
  address: string | null;
  is_active?: boolean;
  created_at: string;
  updated_at: string;
  user?: User | null;
}

export interface FetchSupplierParams extends PaginationParams {
  q?: string;
}

export interface CreateSupplierPayload {
  email: string;
  password: string;
  business_name: string;
  contact_person: string;
  phone?: string | null;
  address?: string | null;
}

export interface UpdateSupplierPayload {
  email?: string | null;
  password?: string | null;
  business_name?: string | null;
  contact_person?: string | null;
  phone?: string | null;
  address?: string | null;
  is_active?: boolean;
}

export interface SupplierPaginatedResult {
  data: Supplier[];
  meta: PaginationMeta;
}
