import type { DashboardResponse } from "~/types/dashboard";
import type { DeliveryStatus } from "~/types/delivery";
import { customers } from "~~/data/mock/customers";
import { deliveries } from "~~/data/mock/deliveries";
import { orders, orderItems } from "~~/data/mock/orders";
import { payments } from "~~/data/mock/payments";
import { products } from "~~/data/mock/products";

const toDayKey = (value: string | Date) =>
  new Date(value).toISOString().slice(0, 10);

const isWithinDays = (value: string, days: number) => {
  const now = new Date();
  const cutoff = new Date();
  cutoff.setDate(now.getDate() - days);
  return new Date(value) >= cutoff && new Date(value) <= now;
};

export default defineEventHandler(() => {
  const todayKey = toDayKey(new Date());

  const ordersToday = orders.filter(
    (order) => toDayKey(order.created_at) === todayKey,
  ).length;

  const pendingDeliveries = deliveries.filter(
    (delivery) =>
      delivery.status === "scheduled" || delivery.status === "in_transit",
  ).length;

  const lowStockItems = products
    .filter(
      (product) => product.stock_quantity <= product.minimum_stock_quantity,
    )
    .map((product) => ({
      product,
      short_by: Math.max(
        0,
        product.minimum_stock_quantity - product.stock_quantity,
      ),
    }));

  const revenueTotal = payments
    .filter((payment) => payment.status === "paid" && payment.paid_at)
    .filter((payment) => isWithinDays(payment.paid_at as string, 30))
    .reduce((sum, payment) => sum + payment.amount, 0);

  const revenueSeries = Array.from({ length: 14 }, (_, index) => {
    const date = new Date();
    date.setDate(date.getDate() - (13 - index));
    const dayKey = toDayKey(date);
    const revenue = payments
      .filter((payment) => payment.status === "paid" && payment.paid_at)
      .filter((payment) => toDayKey(payment.paid_at as string) === dayKey)
      .reduce((sum, payment) => sum + payment.amount, 0);
    return {
      date: date.toISOString(),
      revenue,
    };
  });

  const orderItemsByOrder = orderItems.reduce<Record<string, number>>(
    (acc, item) => {
      acc[item.order_id] = (acc[item.order_id] ?? 0) + item.quantity;
      return acc;
    },
    {},
  );

  const deliveriesByOrder = deliveries.reduce<Record<string, DeliveryStatus>>(
    (acc, delivery) => {
      acc[delivery.order_id] = delivery.status;
      return acc;
    },
    {},
  );

  const recentOrders = [...orders]
    .sort((a, b) => (a.created_at < b.created_at ? 1 : -1))
    .slice(0, 6)
    .map((order) => ({
      order,
      customer: customers.find(
        (customer) => customer.id === order.customer_id,
      )!,
      items: orderItemsByOrder[order.id] ?? 0,
      delivery_status: (deliveriesByOrder[order.id] ??
        "unassigned") as DashboardResponse["recent_orders"][number]["delivery_status"],
    }));

  const completedOrderIds = new Set(
    orders.filter((order) => order.status === "completed").map((o) => o.id),
  );

  const topProducts = orderItems
    .filter((item) => completedOrderIds.has(item.order_id))
    .reduce<Record<string, { units: number; revenue: number }>>((acc, item) => {
      const current = acc[item.product_id] ?? { units: 0, revenue: 0 };
      acc[item.product_id] = {
        units: current.units + item.quantity,
        revenue: current.revenue + item.line_total,
      };
      return acc;
    }, {});

  const topProductRows = (
    Object.entries(topProducts) as Array<
      [string, { units: number; revenue: number }]
    >
  )
    .map(([productId, totals]) => ({
      product: products.find((product) => product.id === productId)!,
      units_sold: totals.units,
      revenue: totals.revenue,
    }))
    .sort((a, b) => b.units_sold - a.units_sold)
    .slice(0, 5);

  const deliveryStatuses = deliveries.reduce<Record<DeliveryStatus, number>>(
    (acc, delivery) => {
      acc[delivery.status] = (acc[delivery.status] ?? 0) + 1;
      return acc;
    },
    {} as Record<DeliveryStatus, number>,
  );

  const response: DashboardResponse = {
    range_label: "Last 30 days",
    kpis: [
      {
        id: "revenue",
        label: "Revenue",
        value: revenueTotal,
        delta: 8.2,
        trend: "up",
        unit: "currency",
      },
      {
        id: "orders_today",
        label: "Orders Today",
        value: ordersToday,
        delta: 4.1,
        trend: "up",
        unit: "number",
      },
      {
        id: "pending_deliveries",
        label: "Pending Deliveries",
        value: pendingDeliveries,
        delta: -2.4,
        trend: "down",
        unit: "number",
      },
      {
        id: "low_stock",
        label: "Low Stock Alerts",
        value: lowStockItems.length,
        delta: 1.3,
        trend: "up",
        unit: "number",
      },
    ],
    revenue_series: revenueSeries,
    recent_orders: recentOrders,
    top_products: topProductRows,
    low_stock_items: lowStockItems,
    delivery_statuses: (
      Object.entries(deliveryStatuses) as Array<[DeliveryStatus, number]>
    ).map(([status, count]) => ({
      status,
      count,
    })),
    deliveries,
    generated_at: new Date().toISOString(),
  };

  return response;
});
