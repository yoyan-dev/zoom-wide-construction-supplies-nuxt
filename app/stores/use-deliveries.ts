import { ref } from "vue";
import { defineStore } from "pinia";
import type {
  CreateDeliveryPayload,
  Delivery,
  FetchDeliveryParams,
  UpdateDeliveryPayload,
} from "~/types/delivery";
import type { PaginationMeta } from "~/types/pagination";
import type { StoreResponse } from "~/types/store-response";
import { apiRequest } from "~/utils/api";

export const useDeliveryStore = defineStore("deliveries", () => {
  const deliveries = ref<Delivery[]>([]);
  const delivery = ref<Delivery | null>(null);
  const totalDeliveries = ref(0);
  const isLoading = ref(false);

  const query = ref<FetchDeliveryParams>({
    q: "",
    page: 1,
  });

  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const syncDeliveryRecord = (nextDelivery: Delivery) => {
    delivery.value = nextDelivery;
    const existingIndex = deliveries.value.findIndex(
      (entry) => entry.id === nextDelivery.id,
    );

    if (existingIndex === -1) {
      deliveries.value = [nextDelivery, ...deliveries.value];
      totalDeliveries.value += 1;
      return;
    }

    deliveries.value = deliveries.value.map((entry) =>
      entry.id === nextDelivery.id ? nextDelivery : entry,
    );
  };

  async function fetchDeliveries(params?: FetchDeliveryParams) {
    isLoading.value = true;

    try {
      if (params) {
        query.value = {
          ...query.value,
          ...params,
        };
      }

      const result = await apiRequest<Delivery[]>("/deliveries", {
        query: query.value,
      });

      deliveries.value = result.data || [];
      totalDeliveries.value =
        result.total || result.meta?.total || result.data?.length || 0;

      pagination.value = {
        page: result.meta?.page || 1,
        limit: result.meta?.limit || 10,
        total: result.meta?.total || result.total || result.data?.length || 0,
        totalPages: result.meta?.totalPages || 0,
      };

      return {
        status: "success",
        message: result.message || "Deliveries fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching deliveries:", error);

      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to fetch deliveries",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchDeliveryById(id: string) {
    isLoading.value = true;

    try {
      const result = await apiRequest<Delivery>(`/deliveries/${id}`);
      delivery.value = result.data;

      return {
        status: "success",
        message: result.message || "Delivery fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching delivery:", error);
      delivery.value = null;

      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to fetch delivery",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function updateDelivery(
    id: string,
    payload: UpdateDeliveryPayload,
  ): Promise<StoreResponse<Delivery>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Delivery>(`/deliveries/${id}`, {
        method: "PATCH",
        body: payload,
      });

      delivery.value = result.data || delivery.value;

      if (result.data) {
        deliveries.value = deliveries.value.map((entry) =>
          entry.id === id ? result.data : entry,
        );
      }

      return {
        status: "success",
        message: result.message || "Delivery updated successfully",
        statusMessage: result.statusMessage || "accepted",
        data: result.data || null,
      };
    } catch (error) {
      console.error("Error updating delivery:", error);

      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to update delivery",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function createDelivery(
    payload: CreateDeliveryPayload,
  ): Promise<StoreResponse<Delivery>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Delivery>("/deliveries", {
        method: "POST",
        body: payload,
      });

      if (result.data) {
        syncDeliveryRecord(result.data);
      }

      return {
        status: "success",
        message: result.message || "Delivery created successfully",
        statusMessage: result.statusMessage || "created",
        data: result.data || null,
      };
    } catch (error) {
      console.error("Error creating delivery:", error);
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to create delivery",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    deliveries,
    delivery,
    totalDeliveries,
    isLoading,
    query,
    pagination,
    fetchDeliveries,
    fetchDeliveryById,
    createDelivery,
    updateDelivery,
  };
});
