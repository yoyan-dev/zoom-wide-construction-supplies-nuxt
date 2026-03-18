import type { Customer } from "./customer";
import type { Delivery, DeliveryStatus } from "./delivery";
import type { Order } from "./order";
import type { Product } from "./product";

export type DashboardTrend = "up" | "down" | "flat";

export interface DashboardKpi {
  id: "revenue" | "orders_today" | "pending_deliveries" | "low_stock";
  label: string;
  value: number;
  delta: number;
  trend: DashboardTrend;
  unit?: "currency" | "number";
}

export interface DashboardRevenuePoint {
  date: string;
  revenue: number;
}

export interface DashboardOrderRow {
  order: Order;
  customer: Customer;
  items: number;
  delivery_status: DeliveryStatus | "unassigned";
}

export interface DashboardTopProductRow {
  product: Product;
  units_sold: number;
  revenue: number;
}

export interface DashboardLowStockRow {
  product: Product;
  short_by: number;
}

export interface DashboardDeliverySummary {
  status: DeliveryStatus;
  count: number;
}

export interface DashboardResponse {
  range_label: string;
  kpis: DashboardKpi[];
  revenue_series: DashboardRevenuePoint[];
  recent_orders: DashboardOrderRow[];
  top_products: DashboardTopProductRow[];
  low_stock_items: DashboardLowStockRow[];
  delivery_statuses: DashboardDeliverySummary[];
  deliveries: Delivery[];
  generated_at: string;
}
