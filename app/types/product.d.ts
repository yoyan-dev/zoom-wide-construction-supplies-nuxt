import type { Category } from "./category";
import type { Supplier } from "./supplier";

export interface Product {
  id?: string;
  category_id?: string;
  supplier_id?: string | null;
  sku?: string;
  name?: string;
  description?: string | null;
  image_url?: string | null;
  unit?: string;
  price?: number;
  stock_quantity?: number;
  minimum_stock_quantity?: number;
  category?: Category;
  supplier?: Supplier;
  is_active?: boolean;
  created_at?: string;
  updated_at?: string;
}

export interface FetchProductParams {
  q?: string;
  category_id?: string;
  supplier_id?: string;
  page?: number;
}

export interface ProductPaginaton {
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
}
