export type InventoryMovementType = "in" | "out" | "adjustment";

export interface InventoryLog {
  id: string;
  product_id: string;
  movement_type: InventoryMovementType;
  quantity_change: number;
  reference_type: string | null;
  reference_id: string | null;
  note: string | null;
  created_by: string | null;
  created_at: string;
}

export interface FetchInventoryParams {
  q?: string;
  movement_type?: InventoryMovementType | "";
  product_id?: string;
  page?: number;
}

export interface InventoryPagination {
  page?: number;
  limit?: number;
  total?: number;
  total_pages?: number;
}
