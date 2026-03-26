import { ref } from "vue";
import { defineStore } from "pinia";
import type { H3Response } from "~/types/h3Response";
import type { PaginationMeta } from "~/types/pagination";
import type {
  CreateOrderPayload,
  FetchOrderParams,
  Order,
  OrderItem,
} from "~/types/order";
import type { StoreResponse } from "~/types/store-response";

const BASE_URL = import.meta.env.VITE_API_URL;
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

  function buildQueryString(params?: FetchOrderParams) {
    const searchParams = new URLSearchParams();

    if (!params) return searchParams.toString();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }

  async function fetchOrders(params?: FetchOrderParams) {
    isLoading.value = true;

    try {
      if (params) {
        query.value = {
          ...query.value,
          ...params,
        };
      }

      const queryString = buildQueryString(query.value);
      const response = await fetch(`${BASE_URL}/orders?${queryString}`);
      const result: H3Response<Order[]> = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(result.message || "Failed to fetch orders");
      }

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
      console.error("Error fetching orders:", error);
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to fetch orders",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchOrderById(id: string) {
    isLoading.value = true;

    try {
      const response = await fetch(`${BASE_URL}/orders/${id}`);
      const result: H3Response<Order> = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(result.message || "Failed to fetch order");
      }

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
      console.error("Error fetching order:", error);
      order.value = null;

      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to fetch order",
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
      const response = await fetch(`${BASE_URL}/orders`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result: H3Response<Order> = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(result.message || "Failed to create order");
      }

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
      console.error("Error creating order:", error);
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to create order",
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
  };
});
