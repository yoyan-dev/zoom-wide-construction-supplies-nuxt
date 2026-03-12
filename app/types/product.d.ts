export interface Product {
  id: string;
  category_id: string;
  supplier_id: string | null;
  sku: string;
  name: string;
  description: string | null;
  image_url: string | null;
  unit: string;
  price: number;
  stock_quantity: number;
  minimum_stock_quantity: number;
  is_active: boolean;
  created_at: string;
  updated_at: string;
}
