import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  FetchOrderParams,
  Order,
  OrderItem,
  OrderPagination,
} from "~/types/order";
import type { H3Response } from "~/types/h3Response";
import { orders as seedOrders, orderItems as seedOrderItems } from "~/seeds/orders";
import { downloadText, printText } from "~/utils/documents";

type OrderActivity = {
  action: string;
  at: string;
  detail?: string;
};

const buildOkResponse = <T>(data: T, total?: number): H3Response<T> => ({
  status: "ok",
  statusCode: 200,
  statusMessage: "ok",
  data,
  total,
});

const buildErrorResponse = <T>(err: unknown): H3Response<T> => ({
  status: "error",
  statusCode: 500,
  statusMessage: "internal server error",
  message: err instanceof Error ? err.message : "Unknown error",
});

export const useOrderStore = defineStore("orders", () => {
  const error = ref<Error | null>(null);
  const order = ref<Order | null>(null);
  const isLoading = ref(false);

  const allOrders = ref<Order[]>([...seedOrders]);
  const orders = ref<Order[]>([]);
  const orderItems = ref<OrderItem[]>([...seedOrderItems]);
  const orderActivity = ref<Record<string, OrderActivity[]>>({});

  const query = ref<FetchOrderParams>({
    q: "",
    status: "",
    customer_id: "",
    page: 1,
  });

  const pagination = ref<OrderPagination>({
    page: 1,
    limit: seedOrders.length,
    total: 0,
    total_pages: 0,
  });

  const fetchOrders = async (): Promise<H3Response<Order[]>> => {
    try {
      isLoading.value = true;

      let filtered = [...allOrders.value];

      if (query.value.q) {
        const q = query.value.q.toLowerCase();
        filtered = filtered.filter((o) => {
          const notes = o.notes ?? "";
          return (
            o.id.toLowerCase().includes(q) ||
            notes.toLowerCase().includes(q) ||
            o.customer_id.toLowerCase().includes(q)
          );
        });
      }

      if (query.value.status) {
        filtered = filtered.filter((o) => o.status === query.value.status);
      }

      if (query.value.customer_id) {
        filtered = filtered.filter(
          (o) => o.customer_id === query.value.customer_id,
        );
      }

      const start = (query.value.page! - 1) * pagination.value.limit!;
      const end = start + pagination.value.limit!;

      pagination.value.total = filtered.length;
      pagination.value.total_pages = Math.ceil(
        filtered.length / pagination.value.limit!,
      );
      pagination.value.page = query.value.page;

      orders.value = filtered.slice(start, end);
      return buildOkResponse(orders.value, pagination.value.total);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Order[]>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchOrderById = async (
    id: string,
  ): Promise<H3Response<Order | null>> => {
    try {
      const found = allOrders.value.find((o) => o.id === id);

      if (!found) {
        order.value = null;
        return buildOkResponse(null, 0);
      }

      order.value = found;
      return buildOkResponse(order.value, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Order | null>(err);
    }
  };

  const fetchOrderItemsByOrderId = async (
    orderId: string,
  ): Promise<H3Response<OrderItem[]>> => {
    try {
      const items = orderItems.value.filter((item) => item.order_id === orderId);
      return buildOkResponse(items, items.length);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<OrderItem[]>(err);
    }
  };

  const logOrderActivity = (orderId: string, action: string, detail?: string) => {
    const entry: OrderActivity = {
      action,
      detail,
      at: new Date().toISOString(),
    };
    const current = orderActivity.value[orderId] ?? [];
    orderActivity.value = {
      ...orderActivity.value,
      [orderId]: [entry, ...current],
    };
  };

  const updateOrder = async (
    id: string,
    payload: Partial<Order>,
    log?: { action: string; detail?: string },
  ): Promise<H3Response<Order | null>> => {
    try {
      isLoading.value = true;
      const index = allOrders.value.findIndex((item) => item.id === id);

      if (index === -1) {
        return buildOkResponse(null, 0);
      }

      const updated: Order = {
        ...allOrders.value[index],
        ...payload,
        id,
        updated_at: new Date().toISOString(),
      };

      allOrders.value.splice(index, 1, updated);

      if (order.value?.id === id) {
        order.value = updated;
      }

      if (log) {
        logOrderActivity(id, log.action, log.detail);
      }

      await fetchOrders();

      return buildOkResponse(updated, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Order | null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const deleteOrder = async (id: string): Promise<H3Response<null>> => {
    try {
      isLoading.value = true;
      allOrders.value = allOrders.value.filter((item) => item.id !== id);
      orderItems.value = orderItems.value.filter((item) => item.order_id !== id);

      if (order.value?.id === id) {
        order.value = null;
      }

      logOrderActivity(id, "Order deleted");
      await fetchOrders();

      return buildOkResponse(null, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const recalcOrderTotal = async (orderId: string, logAction?: string) => {
    const total = orderItems.value
      .filter((item) => item.order_id === orderId)
      .reduce((sum, item) => sum + item.line_total, 0);
    await updateOrder(orderId, { total_amount: total }, logAction
      ? { action: logAction, detail: `Total recalculated to ${total}` }
      : undefined);
  };

  const updateOrderStatus = async (
    id: string,
    status: Order["status"],
    detail?: string,
  ) => {
    const current = allOrders.value.find((item) => item.id === id);
    const nextApproved =
      status === "approved" ? "admin" : current?.approved_by ?? null;
    const nextRejection =
      status === "rejected" ? detail ?? "Rejected" : current?.rejection_reason ?? null;

    await updateOrder(
      id,
      {
        status,
        approved_by: nextApproved,
        rejection_reason: nextRejection,
      },
      { action: `Status updated to ${status}`, detail },
    );
  };

  const updateOrderTotal = async (id: string, total: number) => {
    await updateOrder(
      id,
      { total_amount: total },
      { action: "Order total updated", detail: `Total set to ${total}` },
    );
  };

  const applyOrderDiscount = async (id: string, discount: number) => {
    const current = allOrders.value.find((item) => item.id === id);
    if (!current) return;
    const nextTotal = Math.max(current.total_amount - discount, 0);
    await updateOrder(
      id,
      { total_amount: nextTotal },
      {
        action: "Discount applied",
        detail: `Discount ${discount} applied, new total ${nextTotal}`,
      },
    );
  };

  const addOrderItem = async (
    payload: Omit<OrderItem, "id" | "created_at" | "updated_at" | "line_total"> &
      Partial<Pick<OrderItem, "line_total">>,
  ): Promise<H3Response<OrderItem>> => {
    try {
      isLoading.value = true;
      const now = new Date().toISOString();
      const lineTotal =
        payload.line_total ?? payload.quantity * payload.unit_price;
      const created: OrderItem = {
        id: `item-${Date.now()}`,
        order_id: payload.order_id,
        product_id: payload.product_id,
        quantity: payload.quantity,
        unit_price: payload.unit_price,
        line_total: lineTotal,
        created_at: now,
        updated_at: now,
      };

      orderItems.value = [created, ...orderItems.value];
      logOrderActivity(
        payload.order_id,
        "Item added",
        `${payload.product_id} x${payload.quantity}`,
      );
      await recalcOrderTotal(payload.order_id);

      return buildOkResponse(created, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<OrderItem>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const updateOrderItem = async (
    id: string,
    payload: Partial<OrderItem>,
  ): Promise<H3Response<OrderItem | null>> => {
    try {
      isLoading.value = true;
      const index = orderItems.value.findIndex((item) => item.id === id);
      if (index === -1) {
        return buildOkResponse(null, 0);
      }

      const current = orderItems.value[index];
      const nextQuantity = payload.quantity ?? current.quantity;
      const nextPrice = payload.unit_price ?? current.unit_price;
      const nextLineTotal =
        payload.line_total ?? nextQuantity * nextPrice;

      const updated: OrderItem = {
        ...current,
        ...payload,
        quantity: nextQuantity,
        unit_price: nextPrice,
        line_total: nextLineTotal,
        updated_at: new Date().toISOString(),
      };

      orderItems.value.splice(index, 1, updated);
      logOrderActivity(
        updated.order_id,
        "Item updated",
        `${updated.product_id} x${updated.quantity}`,
      );
      await recalcOrderTotal(updated.order_id);

      return buildOkResponse(updated, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<OrderItem | null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const removeOrderItem = async (
    id: string,
  ): Promise<H3Response<null>> => {
    try {
      isLoading.value = true;
      const current = orderItems.value.find((item) => item.id === id);
      if (!current) return buildOkResponse(null, 0);

      orderItems.value = orderItems.value.filter((item) => item.id !== id);
      logOrderActivity(
        current.order_id,
        "Item removed",
        current.product_id,
      );
      await recalcOrderTotal(current.order_id);

      return buildOkResponse(null, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const duplicateOrder = async (id: string): Promise<H3Response<Order | null>> => {
    try {
      isLoading.value = true;
      const current = allOrders.value.find((item) => item.id === id);
      if (!current) return buildOkResponse(null, 0);

      const now = new Date().toISOString();
      const newId = `ord-${Date.now()}`;
      const duplicated: Order = {
        ...current,
        id: newId,
        status: "pending",
        approved_by: null,
        rejection_reason: null,
        created_at: now,
        updated_at: now,
      };

      allOrders.value = [duplicated, ...allOrders.value];

      const duplicatedItems = orderItems.value
        .filter((item) => item.order_id === id)
        .map((item) => ({
          ...item,
          id: `item-${Date.now()}-${Math.random().toString(16).slice(2, 6)}`,
          order_id: newId,
          created_at: now,
          updated_at: now,
        }));

      orderItems.value = [...duplicatedItems, ...orderItems.value];
      logOrderActivity(newId, "Order duplicated", `Source ${id}`);
      await fetchOrders();

      return buildOkResponse(duplicated, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Order | null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const exportOrder = (id: string) => {
    const current = allOrders.value.find((item) => item.id === id);
    if (!current) return;
    const items = orderItems.value.filter((item) => item.order_id === id);
    const payload = JSON.stringify({ order: current, items }, null, 2);
    downloadText(`order-${id}.json`, payload, "application/json");
    logOrderActivity(id, "Order exported");
  };

  const buildOrderDocument = (id: string, type: string) => {
    const current = allOrders.value.find((item) => item.id === id);
    if (!current) return "";
    const items = orderItems.value.filter((item) => item.order_id === id);
    const lines = [
      `Order ${current.id}`,
      `Status: ${current.status}`,
      `Customer: ${current.customer_id}`,
      `Total: ${current.total_amount}`,
      "",
      "Items:",
      ...items.map(
        (item) =>
          `${item.product_id} x${item.quantity} @ ${item.unit_price} = ${item.line_total}`,
      ),
      "",
      `Document: ${type}`,
    ];
    return lines.join("\n");
  };

  const printOrderDocument = (id: string, type: string) => {
    const content = buildOrderDocument(id, type);
    if (!content) return;
    printText(`Order ${id} ${type}`, content);
    logOrderActivity(id, `Printed ${type}`);
  };

  const downloadOrderDocument = (id: string, type: string) => {
    const content = buildOrderDocument(id, type);
    if (!content) return;
    downloadText(`order-${id}-${type}.txt`, content, "text/plain");
    logOrderActivity(id, `Downloaded ${type}`);
  };

  const sendOrderCommunication = (id: string, type: string) => {
    logOrderActivity(id, "Communication sent", type);
  };

  const getOrderActivity = (id: string) => orderActivity.value[id] ?? [];

  const setSearch = async (value: string) => {
    query.value.q = value;
    query.value.page = 1;
    return await fetchOrders();
  };

  const setFilter = async (filters: Partial<FetchOrderParams>) => {
    query.value = {
      ...query.value,
      ...filters,
      page: 1,
    };

    return await fetchOrders();
  };

  const setPage = async (page: number) => {
    query.value.page = page;
    return await fetchOrders();
  };

  return {
    order,
    orders,
    orderItems,
    orderActivity,
    query,
    pagination,
    isLoading,
    error,
    fetchOrders,
    fetchOrderById,
    fetchOrderItemsByOrderId,
    logOrderActivity,
    updateOrder,
    updateOrderStatus,
    updateOrderTotal,
    applyOrderDiscount,
    addOrderItem,
    updateOrderItem,
    removeOrderItem,
    duplicateOrder,
    deleteOrder,
    exportOrder,
    printOrderDocument,
    downloadOrderDocument,
    sendOrderCommunication,
    getOrderActivity,
    setSearch,
    setFilter,
    setPage,
  };
});
