import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  Delivery,
  DeliveryPagination,
  FetchDeliveryParams,
} from "~/types/delivery";
import type { H3Response } from "~/types/h3Response";
import { deliveries as seedDeliveries } from "~/seeds/deliveries";

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

export const useDeliveryStore = defineStore("deliveries", () => {
  const error = ref<Error | null>(null);
  const delivery = ref<Delivery | null>(null);
  const isLoading = ref(false);

  const allDeliveries = ref<Delivery[]>([...seedDeliveries]);
  const deliveries = ref<Delivery[]>([]);

  const query = ref<FetchDeliveryParams>({
    q: "",
    status: "",
    order_id: "",
    driver_id: "",
    page: 1,
  });

  const pagination = ref<DeliveryPagination>({
    page: 1,
    limit: seedDeliveries.length,
    total: 0,
    total_pages: 0,
  });

  const fetchDeliveries = async (): Promise<H3Response<Delivery[]>> => {
    try {
      isLoading.value = true;

      let filtered = [...allDeliveries.value];

      if (query.value.q) {
        const q = query.value.q.toLowerCase();
        filtered = filtered.filter((d) => {
          const driver = d.driver_id ?? "";
          const vehicle = d.vehicle_number ?? "";
          return (
            d.id.toLowerCase().includes(q) ||
            d.order_id.toLowerCase().includes(q) ||
            driver.toLowerCase().includes(q) ||
            vehicle.toLowerCase().includes(q)
          );
        });
      }

      if (query.value.status) {
        filtered = filtered.filter((d) => d.status === query.value.status);
      }

      if (query.value.order_id) {
        filtered = filtered.filter((d) => d.order_id === query.value.order_id);
      }

      if (query.value.driver_id) {
        filtered = filtered.filter((d) => d.driver_id === query.value.driver_id);
      }

      const start = (query.value.page! - 1) * pagination.value.limit!;
      const end = start + pagination.value.limit!;

      pagination.value.total = filtered.length;
      pagination.value.total_pages = Math.ceil(
        filtered.length / pagination.value.limit!,
      );
      pagination.value.page = query.value.page;

      deliveries.value = filtered.slice(start, end);
      return buildOkResponse(deliveries.value, pagination.value.total);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Delivery[]>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchDeliveryById = async (
    id: string,
  ): Promise<H3Response<Delivery | null>> => {
    try {
      const found = allDeliveries.value.find((d) => d.id === id);

      if (!found) {
        delivery.value = null;
        return buildOkResponse(null, 0);
      }

      delivery.value = found;
      return buildOkResponse(delivery.value, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Delivery | null>(err);
    }
  };

  const setSearch = async (value: string) => {
    query.value.q = value;
    query.value.page = 1;
    return await fetchDeliveries();
  };

  const setFilter = async (filters: Partial<FetchDeliveryParams>) => {
    query.value = {
      ...query.value,
      ...filters,
      page: 1,
    };

    return await fetchDeliveries();
  };

  const setPage = async (page: number) => {
    query.value.page = page;
    return await fetchDeliveries();
  };

  return {
    delivery,
    deliveries,
    query,
    pagination,
    isLoading,
    error,
    fetchDeliveries,
    fetchDeliveryById,
    setSearch,
    setFilter,
    setPage,
  };
});
