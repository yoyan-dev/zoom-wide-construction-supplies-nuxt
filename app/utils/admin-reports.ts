import { formatStatusLabel } from "./format";

export type AdminReportStatusRow = {
  label: string;
  count: number;
  amount?: number;
};

export type AdminLowStockReportRow = {
  product: {
    id?: string;
    name?: string | null;
    sku?: string | null;
  };
  currentStock: number;
  minimumStock: number;
  state: string;
};

export type AdminCustomerReportRow = {
  id: string;
  name: string;
  contact: string;
  orders: number;
  revenue: number;
};

export type AdminReportCsvPayload = {
  dateRangeLabel: string;
  ordersCount: number;
  grossSales: number;
  orderStatusRows: AdminReportStatusRow[];
  paymentStatusRows: AdminReportStatusRow[];
  movementRows: AdminReportStatusRow[];
  lowStockProducts: AdminLowStockReportRow[];
  deliveryStatusRows: AdminReportStatusRow[];
  customerReportRows: AdminCustomerReportRow[];
};

const escapeCsv = (value: string | number) => {
  const text = String(value);
  return /[",\n]/.test(text) ? `"${text.replace(/"/g, '""')}"` : text;
};

export const buildAdminReportsCsv = (payload: AdminReportCsvPayload) => {
  const rows: Array<Array<string | number>> = [
    ["Admin Reports"],
    ["Date range", payload.dateRangeLabel],
    [],
    ["Sales Report"],
    ["Metric", "Value"],
    ["Orders", payload.ordersCount],
    ["Gross sales", payload.grossSales],
    ...payload.orderStatusRows.map((row) => [
      row.label,
      row.count,
      row.amount ?? 0,
    ]),
    [],
    ["Payment Report"],
    ["Status", "Count", "Amount"],
    ...payload.paymentStatusRows.map((row) => [
      row.label,
      row.count,
      row.amount ?? 0,
    ]),
    [],
    ["Inventory Report"],
    ["Movement", "Records", "Quantity"],
    ...payload.movementRows.map((row) => [
      row.label,
      row.count,
      row.amount ?? 0,
    ]),
    [],
    ["Low Stock Report"],
    ["Product", "SKU", "Current", "Minimum", "Status"],
    ...payload.lowStockProducts.map((row) => [
      row.product.name ?? "Unnamed product",
      row.product.sku ?? "",
      row.currentStock,
      row.minimumStock,
      formatStatusLabel(row.state),
    ]),
    [],
    ["Delivery Performance Report"],
    ["Status", "Count"],
    ...payload.deliveryStatusRows.map((row) => [row.label, row.count]),
    [],
    ["Customer Order History"],
    ["Customer", "Contact", "Orders", "Revenue"],
    ...payload.customerReportRows.map((row) => [
      row.name,
      row.contact,
      row.orders,
      row.revenue,
    ]),
  ];

  return rows.map((row) => row.map(escapeCsv).join(",")).join("\n");
};
