import { ref } from "vue";
import { defineStore } from "pinia";
import type { PaginationMeta } from "~/types/pagination";
import type {
  ApproveOrderPayload,
  CreateOrderPayload,
  FetchOrderParams,
  Order,
  OrderItem,
  RejectOrderPayload,
} from "~/types/order";
import type { StoreResponse } from "~/types/store-response";
import { apiRequest, apiRequestRaw, toErrorMessage } from "~/utils/api";
type OrderWithItems = Order & { items?: OrderItem[] };

const extractOrderItems = (value: unknown): OrderItem[] => {
  if (!Array.isArray(value)) {
    return [];
  }

  return value.flatMap((entry) => {
    if (!entry || typeof entry !== "object" || !("items" in entry)) {
      return [];
    }

    const items = (entry as OrderWithItems).items;
    return Array.isArray(items) ? items : [];
  });
};

export const useOrderStore = defineStore("orders", () => {
  const orders = ref<Order[]>([]);
  const order = ref<Order | null>(null);
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

  const syncOrderRecord = (nextOrder: Order) => {
    order.value = nextOrder;
    orders.value = orders.value.map((entry) =>
      entry.id === nextOrder.id ? nextOrder : entry,
    );
  };

  async function fetchOrders(params?: FetchOrderParams) {
    isLoading.value = true;

    try {
      if (params) {
        query.value = {
          ...query.value,
          ...params,
        };
      }

      const result = await apiRequest<Order[]>("/orders", {
        query: query.value,
      });

      orders.value = result.data || [];
      const embeddedOrderItems = extractOrderItems(result.data);

      if (embeddedOrderItems.length) {
        orderItems.value = embeddedOrderItems;
      }

      totalOrders.value = result.total || result.meta?.total || 0;

      pagination.value = {
        page: result.meta?.page || 1,
        limit: result.meta?.limit || 10,
        total: result.meta?.total || result.total || 0,
        totalPages: result.meta?.totalPages || 0,
      };

      return {
        status: "success",
        message: result.message || "Orders fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to fetch orders",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchOrderById(id: string) {
    isLoading.value = true;

    try {
      const result = await apiRequest<Order>(`/orders/${id}`);

      order.value = result.data;
      const embeddedOrderItems = extractOrderItems(
        result.data ? [result.data] : [],
      );

      if (embeddedOrderItems.length) {
        orderItems.value = [
          ...orderItems.value.filter((item) => item.order_id !== id),
          ...embeddedOrderItems,
        ];
      }

      return {
        status: "success",
        message: result.message || "Order fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      order.value = null;

      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to fetch order",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function createOrder(
    payload: CreateOrderPayload,
  ): Promise<StoreResponse<Order>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Order>("/orders", {
        method: "POST",
        body: payload,
      });

      order.value = result.data || null;

      if (result.data) {
        const alreadyTracked = orders.value.some((entry) => entry.id === result.data.id);
        orders.value = [
          result.data,
          ...orders.value.filter((entry) => entry.id !== result.data.id),
        ];

        if (!alreadyTracked) {
          totalOrders.value += 1;
        }
      }

      orderItems.value = result.data
        ? extractOrderItems([result.data])
        : [];

      return {
        status: "success",
        message: result.message || "Order created successfully",
        statusMessage: result.statusMessage || "created",
        data: result.data || null,
      };
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to create order",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteOrder(id: string): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const { data: result, ok } = await apiRequestRaw<null>(`/orders/${id}`, {
        method: "DELETE",
      });

      if (!ok || (result && result.status === "error")) {
        throw new Error(result?.message || "Failed to delete order");
      }

      orders.value = orders.value.filter((entry) => entry.id !== id);
      totalOrders.value = Math.max(0, totalOrders.value - 1);

      return {
        status: "success",
        message: result?.message || "Order deleted successfully",
        statusMessage: result?.statusMessage || "no content",
      };
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to delete order",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function approveOrder(
    id: string,
    payload: ApproveOrderPayload = {},
  ): Promise<StoreResponse<Order>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Order>(`/orders/${id}/approve`, {
        method: "POST",
        body: payload,
      });

      if (result.data) {
        syncOrderRecord(result.data);
      }

      return {
        status: "success",
        message: result.message || "Order approved successfully",
        statusMessage: result.statusMessage || "accepted",
        data: result.data || null,
      };
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to approve order",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function rejectOrder(
    id: string,
    payload: RejectOrderPayload,
  ): Promise<StoreResponse<Order>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Order>(`/orders/${id}/reject`, {
        method: "POST",
        body: payload,
      });

      if (result.data) {
        syncOrderRecord(result.data);
      }

      return {
        status: "success",
        message: result.message || "Order rejected successfully",
        statusMessage: result.statusMessage || "accepted",
        data: result.data || null,
      };
    } catch (error) {
      return {
        status: "error",
        message: toErrorMessage(error) || "Failed to reject order",
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
    fetchOrders,
    fetchOrderById,
    createOrder,
    deleteOrder,
    approveOrder,
    rejectOrder,
  };
});
