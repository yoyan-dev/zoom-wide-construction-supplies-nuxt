export interface Supplier {
  id?: string;
  name?: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
  created_at?: string;
  updated_at?: string;
}

export interface FetchSupplierParams {
  q?: string;
  page?: number;
}

export interface SupplierPagination {
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
}
