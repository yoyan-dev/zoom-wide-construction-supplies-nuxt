export type OrderStatus =
  | "pending"
  | "approved"
  | "rejected"
  | "cancelled"
  | "completed";

export interface Order {
  id: string;
  customer_id: string;
  status: OrderStatus;
  total_amount: number;
  notes: string | null;
  approved_by: string | null;
  rejection_reason: string | null;
  created_at: string;
  updated_at: string;
}

export interface OrderItem {
  id: string;
  order_id: string;
  product_id: string;
  quantity: number;
  unit_price: number;
  line_total: number;
  created_at: string;
  updated_at: string;
}

export interface FetchOrderParams {
  q?: string;
  status?: OrderStatus | "";
  customer_id?: string;
  page?: number;
}

export interface OrderPagination {
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
}
