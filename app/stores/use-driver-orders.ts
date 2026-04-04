import { ref } from "vue";
import { defineStore } from "pinia";
import type { DriverAssignedOrder, FetchOrderParams, OrderItem } from "~/types/order";
import type { PaginationMeta } from "~/types/pagination";
import type { StoreResponse } from "~/types/store-response";
import { apiRequest, toErrorMessage } from "~/utils/api";

type DriverDeliveredPayload = {
  delivered_at?: string | null;
};

const extractOrderItems = (value: unknown): OrderItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || !("items" in entry)) {
      return [];
    }

    const items = (entry as DriverAssignedOrder).items;
    return Array.isArray(items) ? items : [];
  });
};

const resolveDeliveryRecord = (value: DriverAssignedOrder) => {
  if (value.delivery) {
    return value.delivery;
  }

  if (Array.isArray(value.deliveries)) {
    return value.deliveries[0] ?? null;
  }

  return null;
};

export const useDriverOrdersStore = defineStore("driver-orders", () => {
  const orders = ref<DriverAssignedOrder[]>([]);
  const order = ref<DriverAssignedOrder | null>(null);
  const orderItems = ref<OrderItem[]>([]);
  const totalOrders = ref(0);
  const isLoading = ref(false);

  const query = ref<FetchOrderParams>({
    q: "",
    page: 1,
  });

  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const syncOrderRecord = (nextOrder: DriverAssignedOrder) => {
    order.value = nextOrder;

    const existingIndex = orders.value.findIndex((entry) => entry.id === nextOrder.id);

    if (existingIndex === -1) {
      orders.value = [nextOrder, ...orders.value];
      totalOrders.value += 1;
      return;
    }

    orders.value = orders.value.map((entry) =>
      entry.id === nextOrder.id ? nextOrder : entry,
    );
  };

  async function fetchDriverOrders(
    driverId: string,
    params?: FetchOrderParams,
  ): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      if (params) {
        query.value = {
          ...query.value,
          ...params,
        };
      }

      const result = await apiRequest<DriverAssignedOrder[]>(
        `/drivers/${driverId}/orders`,
        {
          query: query.value,
        },
      );

      orders.value = (result.data || []).map((entry) => ({
        ...entry,
        delivery: resolveDeliveryRecord(entry),
      }));
      orderItems.value = extractOrderItems(result.data);
      totalOrders.value = result.total || result.meta?.total || orders.value.length || 0;

      pagination.value = {
        page: result.meta?.page || 1,
        limit: result.meta?.limit || 10,
        total: result.meta?.total || result.total || orders.value.length || 0,
        totalPages: result.meta?.totalPages || 0,
      };

      return {
        status: "success",
        message: result.message || "Driver orders fetched successfully",
        statusMessage: result.statusMessage,
      };
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to fetch driver orders",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchDriverOrderById(
    driverId: string,
    orderId: string,
  ): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const result = await apiRequest<DriverAssignedOrder>(
        `/drivers/${driverId}/orders/${orderId}`,
      );

      const nextOrder = result.data
        ? {
            ...result.data,
            delivery: resolveDeliveryRecord(result.data),
          }
        : null;

      order.value = nextOrder;

      if (nextOrder) {
        orders.value = orders.value.map((entry) =>
          entry.id === nextOrder.id ? nextOrder : entry,
        );

        const embeddedItems = extractOrderItems([result.data]);
        if (embeddedItems.length) {
          orderItems.value = [
            ...orderItems.value.filter((item) => item.order_id !== orderId),
            ...embeddedItems,
          ];
        }
      }

      return {
        status: "success",
        message: result.message || "Driver order fetched successfully",
        statusMessage: result.statusMessage,
      };
    } catch (error) {
      order.value = null;

      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to fetch driver order",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function markOrderDelivered(
    driverId: string,
    orderId: string,
    payload: DriverDeliveredPayload = {},
  ): Promise<StoreResponse<DriverAssignedOrder>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<DriverAssignedOrder>(
        `/drivers/${driverId}/orders/${orderId}/delivered`,
        {
          method: "POST",
          body: payload,
        },
      );

      const nextOrder = result.data
        ? {
            ...result.data,
            delivery: resolveDeliveryRecord(result.data),
          }
        : null;

      if (nextOrder) {
        syncOrderRecord(nextOrder);

        const embeddedItems = extractOrderItems([result.data]);
        if (embeddedItems.length) {
          orderItems.value = [
            ...orderItems.value.filter((item) => item.order_id !== orderId),
            ...embeddedItems,
          ];
        }
      }

      return {
        status: "success",
        message: result.message || "Order marked as delivered successfully",
        statusMessage: result.statusMessage || "accepted",
        data: nextOrder,
      };
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to mark order as delivered",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    orders,
    order,
    orderItems,
    totalOrders,
    isLoading,
    query,
    pagination,
    fetchDriverOrders,
    fetchDriverOrderById,
    markOrderDelivered,
  };
});
