export type DeliveryStatus =
  | "scheduled"
  | "in_transit"
  | "delivered"
  | "failed";

export interface Delivery {
  id: string;
  order_id: string;
  driver_name: string | null;
  vehicle_number: string | null;
  status: DeliveryStatus;
  scheduled_at: string | null;
  delivered_at: string | null;
  created_at: string;
  updated_at: string;
}
