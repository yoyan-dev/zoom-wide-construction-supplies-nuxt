import type { Customer } from "~/types/customer";
import type { Delivery, DeliveryStatus } from "~/types/delivery";
import type { Driver } from "~/types/driver";
import type { Order, OrderItem, OrderStatus } from "~/types/order";
import type { Product } from "~/types/product";
import { formatShortDate } from "~/utils/format";
import type {
  StaffActivity,
  StaffCustomerConcern,
  StaffDelivery as StaffDeliveryRow,
  StaffDeliverySummary,
  StaffOrder as StaffOrderRow,
  StaffQuickAction,
  StaffQuickActionTemplate,
  StaffStat,
  StaffStockAlert,
  StaffTask,
  StaffTone,
} from "./staff-dashboard.types";

type ById<T> = Record<string, T>;
type GroupedOrderItems = Record<string, OrderItem[]>;

const compareDatesDesc = (left?: string | null, right?: string | null) =>
  new Date(right ?? 0).getTime() - new Date(left ?? 0).getTime();

const formatRelativeBucket = (value?: string | null) => {
  if (!value) return "Schedule pending";
  const date = new Date(value);
  const now = new Date();
  const diffDays = Math.round(
    (date.getTime() - now.getTime()) / (1000 * 60 * 60 * 24),
  );

  if (diffDays === 0) return `Today, ${formatShortDate(value)}`;
  if (diffDays === 1) return `Tomorrow, ${formatShortDate(value)}`;
  if (diffDays > 1) return `In ${diffDays} days`;
  if (diffDays === -1) return `Yesterday, ${formatShortDate(value)}`;
  return `${Math.abs(diffDays)} days ago`;
};

const isToday = (value?: string | null) => {
  if (!value) return false;
  const date = new Date(value);
  const now = new Date();
  return date.toDateString() === now.toDateString();
};

const buildOrderItemsSummary = (
  orderId: string,
  orderItemsByOrderId: GroupedOrderItems,
  productsById: ById<Product>,
) => {
  const items = orderItemsByOrderId[orderId] ?? [];

  if (!items.length) return "Item breakdown pending";

  const summary = items.slice(0, 3).map((item) => {
    const product = productsById[item.product_id];
    const productName = product?.name ?? item.product_id;
    const unit = product?.unit ?? "unit";
    return `${item.quantity} ${unit}${item.quantity > 1 ? "s" : ""} ${productName}`;
  });

  return items.length > 3 ? `${summary.join(", ")} +${items.length - 3} more` : summary.join(", ");
};

const getAddressLabel = (customer?: Customer) => {
  const address = customer?.shipping_address ?? customer?.billing_address;
  if (!address) return customer?.company_name ?? "Site coordination pending";
  const parts = address.split(",").map((item) => item.trim());
  return parts.slice(0, 2).join(", ");
};

const orderStatusMeta: Record<
  OrderStatus,
  { label: string; tone: StaffTone; assignee: string }
> = {
  pending: {
    label: "Needs review",
    tone: "warning",
    assignee: "Order desk",
  },
  approved: {
    label: "Ready for dispatch",
    tone: "success",
    assignee: "Dispatch desk",
  },
  rejected: {
    label: "Needs customer follow-up",
    tone: "error",
    assignee: "Customer support",
  },
  cancelled: {
    label: "Cancelled",
    tone: "neutral",
    assignee: "Order desk",
  },
  completed: {
    label: "Completed",
    tone: "primary",
    assignee: "Fulfillment closed",
  },
};

const deliveryStatusMeta: Record<
  DeliveryStatus,
  { label: string; tone: StaffTone; detail: string }
> = {
  scheduled: {
    label: "Scheduled",
    tone: "warning",
    detail: "Awaiting final dispatch",
  },
  in_transit: {
    label: "In transit",
    tone: "info",
    detail: "Route monitoring active",
  },
  delivered: {
    label: "Delivered",
    tone: "success",
    detail: "Drop-off completed",
  },
  failed: {
    label: "Failed",
    tone: "error",
    detail: "Resolution required",
  },
  cancelled: {
    label: "Cancelled",
    tone: "neutral",
    detail: "Dispatch closed",
  },
};

export const getLowStockProducts = (products: Product[]) =>
  [...products]
    .filter((product) => {
      const stock = product.stock_quantity ?? 0;
      const minimum = product.minimum_stock_quantity ?? 0;
      return minimum > 0 && stock <= minimum;
    })
    .sort(
      (left, right) =>
        (left.stock_quantity ?? 0) - (right.stock_quantity ?? 0),
    );

export const buildStaffStats = ({
  orders,
  deliveries,
  lowStockProducts,
  pendingConcerns,
  followUpItems,
}: {
  orders: Order[];
  deliveries: Delivery[];
  lowStockProducts: Product[];
  pendingConcerns: number;
  followUpItems: number;
}): StaffStat[] => {
  const ordersToReview = orders.filter(
    (order) => order.status === "pending" || order.status === "rejected",
  ).length;
  const activeDeliveries = deliveries.filter(
    (delivery) =>
      delivery.status === "scheduled" || delivery.status === "in_transit",
  ).length;
  const processedToday = orders.filter(
    (order) => isToday(order.updated_at) && order.status !== "pending",
  ).length;

  return [
    {
      id: "orders-review",
      label: "Orders To Review",
      value: String(ordersToReview),
      description: "Orders waiting for approval, clarification, or dispatch planning.",
      change: `${orders.filter((order) => isToday(order.created_at)).length} created today`,
      icon: "i-lucide-shopping-cart",
      tone: "warning",
    },
    {
      id: "active-deliveries",
      label: "Active Deliveries",
      value: String(activeDeliveries),
      description: "Scheduled and in-transit deliveries that still need active follow-up.",
      change: `${deliveries.filter((delivery) => delivery.status === "in_transit").length} currently on route`,
      icon: "i-lucide-truck",
      tone: "info",
    },
    {
      id: "low-stock",
      label: "Low Stock Products",
      value: String(lowStockProducts.length),
      description: "Fast-moving construction items close to reorder or transfer thresholds.",
      change: `${lowStockProducts.filter((product) => {
        const minimum = product.minimum_stock_quantity ?? 0;
        if (!minimum) return false;
        return (product.stock_quantity ?? 0) / minimum <= 0.6;
      }).length} critical items`,
      icon: "i-lucide-triangle-alert",
      tone: "error",
    },
    {
      id: "customer-concerns",
      label: "Pending Customer Concerns",
      value: String(pendingConcerns),
      description: "Quotation requests, order follow-ups, and stock availability inquiries.",
      change: `${orders.filter((order) => order.status === "pending").length} tied to open orders`,
      icon: "i-lucide-message-square",
      tone: "primary",
    },
    {
      id: "processed-orders",
      label: "Processed Today",
      value: String(processedToday),
      description: "Orders already reviewed, endorsed, or handed to dispatch today.",
      change: `${orders.filter((order) => order.status === "completed").length} completed overall`,
      icon: "i-lucide-clipboard-check",
      tone: "success",
    },
    {
      id: "follow-up-items",
      label: "Follow-up Items",
      value: String(followUpItems),
      description: "Operational tasks that still require callbacks, updates, or confirmations.",
      change: `${Math.min(followUpItems, 3)} due next`,
      icon: "i-lucide-list-todo",
      tone: "neutral",
    },
  ];
};

export const buildStaffQuickActions = ({
  templates,
  ordersToReview,
  lowStockCount,
  concernsCount,
  activeDeliveries,
  processedToday,
  followUpItems,
}: {
  templates: StaffQuickActionTemplate[];
  ordersToReview: number;
  lowStockCount: number;
  concernsCount: number;
  activeDeliveries: number;
  processedToday: number;
  followUpItems: number;
}): StaffQuickAction[] =>
  templates.map((template) => {
    const countMap: Record<string, string> = {
      "view-orders": `${ordersToReview} queued`,
      "check-products": `${lowStockCount} alerts`,
      "check-customers": `${concernsCount} waiting`,
      "monitor-deliveries": `${activeDeliveries} active`,
      "view-reports": `${processedToday} processed today`,
      "open-pending-tasks": `${followUpItems} tasks`,
    };

    return {
      ...template,
      count: countMap[template.id] ?? "Open",
    };
  });

export const buildStaffRecentOrders = ({
  orders,
  orderItemsByOrderId,
  productsById,
  customersById,
  deliveriesByOrderId,
}: {
  orders: Order[];
  orderItemsByOrderId: GroupedOrderItems;
  productsById: ById<Product>;
  customersById: ById<Customer>;
  deliveriesByOrderId: ById<Delivery>;
}): StaffOrderRow[] =>
  [...orders]
    .sort((left, right) => compareDatesDesc(left.updated_at, right.updated_at))
    .slice(0, 5)
    .map((order) => {
      const customer = customersById[order.customer_id];
      const delivery = deliveriesByOrderId[order.id];
      const statusMeta = orderStatusMeta[order.status];

      return {
        id: order.id,
        customer: customer?.company_name ?? order.customer_id,
        project: getAddressLabel(customer),
        items: buildOrderItemsSummary(
          order.id,
          orderItemsByOrderId,
          productsById,
        ),
        total: order.total_amount,
        status: statusMeta.label,
        statusTone: statusMeta.tone,
        deliveryWindow: delivery?.scheduled_at
          ? formatRelativeBucket(delivery.scheduled_at)
          : "Awaiting dispatch schedule",
        assignee: statusMeta.assignee,
      };
    });

export const buildStaffPendingTasks = ({
  orders,
  deliveries,
  lowStockProducts,
  customersById,
}: {
  orders: Order[];
  deliveries: Delivery[];
  lowStockProducts: Product[];
  customersById: ById<Customer>;
}): StaffTask[] => {
  const tasks: StaffTask[] = [];

  const pendingOrder = [...orders]
    .filter((order) => order.status === "pending")
    .sort((left, right) => compareDatesDesc(left.created_at, right.created_at))[0];
  if (pendingOrder) {
    tasks.push({
      id: `task-order-${pendingOrder.id}`,
      title: `Review ${pendingOrder.id} for ${customersById[pendingOrder.customer_id]?.company_name ?? pendingOrder.customer_id}`,
      detail: pendingOrder.notes ?? "Validate order notes, item mix, and delivery readiness.",
      due: "Next in queue",
      owner: "Orders",
      priority: "High",
      priorityTone: "warning",
      to: "/staff/orders",
    });
  }

  const unassignedScheduled = deliveries.find(
    (delivery) => delivery.status === "scheduled" && !delivery.driver_id,
  );
  if (unassignedScheduled) {
    tasks.push({
      id: `task-delivery-${unassignedScheduled.id}`,
      title: `Assign driver for ${unassignedScheduled.id}`,
      detail: `Scheduled delivery for ${unassignedScheduled.order_id} is still waiting for driver coordination.`,
      due: "Before dispatch cutoff",
      owner: "Dispatch",
      priority: "Critical",
      priorityTone: "error",
      to: "/staff/deliveries",
    });
  }

  const criticalStock = lowStockProducts[0];
  if (criticalStock) {
    tasks.push({
      id: `task-stock-${criticalStock.id}`,
      title: `Validate stock plan for ${criticalStock.name ?? criticalStock.id}`,
      detail: `${criticalStock.sku ?? "SKU pending"} is already at or below its minimum threshold.`,
      due: "This shift",
      owner: "Products",
      priority: "Medium",
      priorityTone: "info",
      to: "/staff/products",
    });
  }

  const rejectedOrder = orders.find((order) => order.status === "rejected");
  if (rejectedOrder) {
    tasks.push({
      id: `task-customer-${rejectedOrder.id}`,
      title: `Follow up ${rejectedOrder.id} with ${customersById[rejectedOrder.customer_id]?.company_name ?? rejectedOrder.customer_id}`,
      detail: rejectedOrder.rejection_reason ?? "Clarify the next step and capture customer confirmation.",
      due: "Same-day callback",
      owner: "Customers",
      priority: "High",
      priorityTone: "warning",
      to: "/staff/customers",
    });
  }

  tasks.push({
    id: "task-report-daily",
    title: "Prepare daily staff operations snapshot",
    detail: "Summarize reviewed orders, active deliveries, and low-stock materials for the supervisor.",
    due: "Before end of shift",
    owner: "Reports",
    priority: "Routine",
    priorityTone: "neutral",
    to: "/staff/reports",
  });

  return tasks.slice(0, 5);
};

export const buildStaffStockAlerts = (
  lowStockProducts: Product[],
): StaffStockAlert[] =>
  lowStockProducts.slice(0, 5).map((product) => {
    const stock = product.stock_quantity ?? 0;
    const minimum = product.minimum_stock_quantity ?? 0;
    const ratio = minimum > 0 ? stock / minimum : 1;
    const isCritical = ratio <= 0.6;

    return {
      id: product.id ?? product.sku ?? product.name ?? `stock-${stock}`,
      name: product.name ?? "Unnamed product",
      sku: product.sku ?? "No SKU",
      remaining: `${stock} ${product.unit ?? "units"} left`,
      location: product.warehouse?.name ?? "Warehouse not assigned",
      level: isCritical ? "Critical" : "Low",
      levelTone: isCritical ? "error" : "warning",
      restockNote: minimum
        ? `Minimum target: ${minimum} ${product.unit ?? "units"}`
        : "Minimum target not set",
    };
  });

export const buildStaffDeliverySummary = (
  deliveries: Delivery[],
): StaffDeliverySummary[] => [
  {
    id: "scheduled",
    label: "Scheduled",
    value: String(
      deliveries.filter((delivery) => delivery.status === "scheduled").length,
    ),
    tone: "warning",
    icon: "i-lucide-clock-3",
  },
  {
    id: "transit",
    label: "In Transit",
    value: String(
      deliveries.filter((delivery) => delivery.status === "in_transit").length,
    ),
    tone: "info",
    icon: "i-lucide-truck",
  },
  {
    id: "attention",
    label: "Need Attention",
    value: String(
      deliveries.filter(
        (delivery) =>
          delivery.status === "failed" ||
          (delivery.status === "scheduled" && !delivery.driver_id),
      ).length,
    ),
    tone: "error",
    icon: "i-lucide-timer",
  },
];

export const buildStaffDeliveries = ({
  deliveries,
  ordersById,
  customersById,
  driversById,
  orderItemsByOrderId,
  productsById,
}: {
  deliveries: Delivery[];
  ordersById: ById<Order>;
  customersById: ById<Customer>;
  driversById: ById<Driver>;
  orderItemsByOrderId: GroupedOrderItems;
  productsById: ById<Product>;
}): StaffDeliveryRow[] =>
  [...deliveries]
    .sort((left, right) =>
      compareDatesDesc(
        left.scheduled_at ?? left.updated_at,
        right.scheduled_at ?? right.updated_at,
      ),
    )
    .filter(
      (delivery) =>
        delivery.status === "scheduled" ||
        delivery.status === "in_transit" ||
        delivery.status === "failed",
    )
    .slice(0, 4)
    .map((delivery) => {
      const order = ordersById[delivery.order_id];
      const customer = order ? customersById[order.customer_id] : undefined;
      const driver = delivery.driver_id ? driversById[delivery.driver_id] : undefined;
      const meta = deliveryStatusMeta[delivery.status];

      return {
        id: delivery.id,
        orderId: delivery.order_id,
        destination: getAddressLabel(customer),
        driver: driver?.name ?? "Driver assignment pending",
        status: meta.label,
        statusTone: meta.tone,
        eta: delivery.scheduled_at
          ? `${meta.detail} - ${formatRelativeBucket(delivery.scheduled_at)}`
          : meta.detail,
        loadSummary: buildOrderItemsSummary(
          delivery.order_id,
          orderItemsByOrderId,
          productsById,
        ),
      };
    });

export const buildStaffCustomerConcerns = ({
  orders,
  deliveries,
  lowStockProducts,
  customersById,
}: {
  orders: Order[];
  deliveries: Delivery[];
  lowStockProducts: Product[];
  customersById: ById<Customer>;
}): StaffCustomerConcern[] => {
  const concerns: StaffCustomerConcern[] = [];

  const pendingOrders = [...orders]
    .filter((order) => order.status === "pending")
    .sort((left, right) => compareDatesDesc(left.created_at, right.created_at));

  for (const order of pendingOrders.slice(0, 2)) {
    concerns.push({
      id: `concern-order-${order.id}`,
      customer: customersById[order.customer_id]?.company_name ?? order.customer_id,
      topic: `Quotation review and approval check for ${order.id}`,
      channel: "Email",
      waitTime: formatRelativeBucket(order.updated_at),
      priority: "High",
      priorityTone: "warning",
      requestedAction: order.notes ?? "Confirm order details and move to approval or dispatch planning.",
      to: "/staff/orders",
    });
  }

  const flaggedDelivery = deliveries.find(
    (delivery) => delivery.status === "scheduled" && !delivery.driver_id,
  );
  if (flaggedDelivery) {
    const relatedOrder = orders.find((order) => order.id === flaggedDelivery.order_id);
    const customer = relatedOrder
      ? customersById[relatedOrder.customer_id]
      : undefined;
    concerns.push({
      id: `concern-delivery-${flaggedDelivery.id}`,
      customer: customer?.company_name ?? flaggedDelivery.order_id,
      topic: `Delivery coordination update needed for ${flaggedDelivery.order_id}`,
      channel: "Phone",
      waitTime: "Before dispatch cutoff",
      priority: "Medium",
      priorityTone: "info",
      requestedAction: "Confirm driver assignment and set customer delivery expectation.",
      to: "/staff/deliveries",
    });
  }

  const stockSensitive = lowStockProducts[0];
  if (stockSensitive) {
    concerns.push({
      id: `concern-stock-${stockSensitive.id}`,
      customer: "Stock-sensitive inquiries",
      topic: `${stockSensitive.name ?? stockSensitive.id} may affect new customer requests`,
      channel: "Chat",
      waitTime: "Inventory-sensitive",
      priority: "Medium",
      priorityTone: "primary",
      requestedAction: "Coordinate reservation, transfer, or substitution before confirming availability.",
      to: "/staff/products",
    });
  }

  const rejectedOrder = orders.find((order) => order.status === "rejected");
  if (rejectedOrder) {
    concerns.push({
      id: `concern-rejected-${rejectedOrder.id}`,
      customer: customersById[rejectedOrder.customer_id]?.company_name ?? rejectedOrder.customer_id,
      topic: `Resolve follow-up for ${rejectedOrder.id}`,
      channel: "Email",
      waitTime: formatRelativeBucket(rejectedOrder.updated_at),
      priority: "High",
      priorityTone: "error",
      requestedAction: rejectedOrder.rejection_reason ?? "Clarify billing or account issue with the customer.",
      to: "/staff/customers",
    });
  }

  return concerns.slice(0, 4);
};

export const buildStaffActivityFeed = ({
  orders,
  deliveries,
  lowStockProducts,
  customersById,
}: {
  orders: Order[];
  deliveries: Delivery[];
  lowStockProducts: Product[];
  customersById: ById<Customer>;
}): StaffActivity[] => {
  const items: Array<StaffActivity & { sortAt: string }> = [];

  for (const order of orders.slice(0, 3)) {
    items.push({
      id: `activity-order-${order.id}`,
      title: `${order.id} is ${orderStatusMeta[order.status].label.toLowerCase()}`,
      detail: `${customersById[order.customer_id]?.company_name ?? order.customer_id} - ${order.notes ?? "Order queue updated."}`,
      time: formatRelativeBucket(order.updated_at),
      icon: "i-lucide-clipboard-check",
      tone: orderStatusMeta[order.status].tone,
      sortAt: order.updated_at,
    });
  }

  for (const delivery of deliveries.slice(0, 2)) {
    items.push({
      id: `activity-delivery-${delivery.id}`,
      title: `${delivery.id} marked ${deliveryStatusMeta[delivery.status].label.toLowerCase()}`,
      detail: `${delivery.order_id} - ${deliveryStatusMeta[delivery.status].detail}`,
      time: formatRelativeBucket(delivery.updated_at),
      icon: "i-lucide-truck",
      tone: deliveryStatusMeta[delivery.status].tone,
      sortAt: delivery.updated_at,
    });
  }

  for (const product of lowStockProducts.slice(0, 1)) {
    items.push({
      id: `activity-stock-${product.id}`,
      title: `${product.name ?? product.id} hit low stock`,
      detail: `${product.stock_quantity ?? 0} ${product.unit ?? "units"} remaining against minimum ${product.minimum_stock_quantity ?? 0}.`,
      time: formatRelativeBucket(product.updated_at),
      icon: "i-lucide-triangle-alert",
      tone: "error",
      sortAt: product.updated_at ?? new Date().toISOString(),
    });
  }

  return items
    .sort((left, right) => compareDatesDesc(left.sortAt, right.sortAt))
    .slice(0, 5)
    .map(({ sortAt: _sortAt, ...item }) => item);
};
