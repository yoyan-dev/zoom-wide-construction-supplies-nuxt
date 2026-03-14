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
    query,
    pagination,
    isLoading,
    error,
    fetchOrders,
    fetchOrderById,
    fetchOrderItemsByOrderId,
    setSearch,
    setFilter,
    setPage,
  };
});
