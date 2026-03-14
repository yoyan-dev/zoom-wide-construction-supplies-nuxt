export interface Driver {
  id: string;
  name: string;
  phone: string | null;
  email: string | null;
  license_number: string | null;
  vehicle_number: string | null;
  created_at: string;
  updated_at: string;
}

export interface FetchDriverParams {
  q?: string;
  page?: number;
}

export interface DriverPagination {
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
}
