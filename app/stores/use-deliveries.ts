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
  const driverDeliveries = ref<Delivery[]>([]);
  const availableDeliveries = ref<Delivery[]>([]);
  const delivery = ref<Delivery | null>(null);
  const totalDeliveries = ref(0);
  const totalDriverDeliveries = ref(0);
  const totalAvailableDeliveries = ref(0);
  const isLoading = ref(false);

  const query = ref<FetchDeliveryParams>({
    q: "",
    page: 1,
  });
  const driverQuery = ref<FetchDeliveryParams>({
    q: "",
    page: 1,
  });
  const availableQuery = ref<FetchDeliveryParams>({
    q: "",
    page: 1,
  });

  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const driverPagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });
  const availablePagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const syncPagination = (
    target: typeof pagination.value,
    result: {
      total?: number;
      meta?: PaginationMeta;
      data?: Delivery[] | null;
    },
  ) => {
    target.page = result.meta?.page || 1;
    target.limit = result.meta?.limit || 10;
    target.total = result.meta?.total || result.total || result.data?.length || 0;
    target.totalPages = result.meta?.totalPages || 0;
  };

  const upsertDeliveryInCollection = (
    collection: Delivery[],
    nextDelivery: Delivery,
  ) => {
    const existingIndex = collection.findIndex((entry) => entry.id === nextDelivery.id);

    if (existingIndex === -1) {
      return [nextDelivery, ...collection];
    }

    return collection.map((entry) =>
      entry.id === nextDelivery.id ? nextDelivery : entry,
    );
  };

  const syncDeliveryRecord = (nextDelivery: Delivery) => {
    delivery.value = nextDelivery;
    const hadDelivery = deliveries.value.some((entry) => entry.id === nextDelivery.id);
    const hadAvailableDelivery = availableDeliveries.value.some(
      (entry) => entry.id === nextDelivery.id,
    );

    deliveries.value = upsertDeliveryInCollection(deliveries.value, nextDelivery);

    if (nextDelivery.driver_id) {
      availableDeliveries.value = availableDeliveries.value.filter(
        (entry) => entry.id !== nextDelivery.id,
      );
      if (hadAvailableDelivery) {
        totalAvailableDeliveries.value = Math.max(0, totalAvailableDeliveries.value - 1);
      }
    } else {
      availableDeliveries.value = upsertDeliveryInCollection(
        availableDeliveries.value,
        nextDelivery,
      );
      if (!hadAvailableDelivery) {
        totalAvailableDeliveries.value += 1;
      }
    }

    if (!hadDelivery) {
      totalDeliveries.value += 1;
    }
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
      syncPagination(pagination.value, result);

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

  async function fetchDriverDeliveries(
    driverId: string,
    params?: FetchDeliveryParams,
  ) {
    isLoading.value = true;

    try {
      if (params) {
        driverQuery.value = {
          ...driverQuery.value,
          ...params,
        };
      }

      const result = await apiRequest<Delivery[]>(`/drivers/${driverId}/deliveries`, {
        query: driverQuery.value,
      });

      driverDeliveries.value = result.data || [];
      totalDriverDeliveries.value =
        result.total || result.meta?.total || result.data?.length || 0;
      syncPagination(driverPagination.value, result);

      return {
        status: "success",
        message: result.message || "Driver deliveries fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching driver deliveries:", error);

      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to fetch driver deliveries",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchAvailableDeliveries(params?: FetchDeliveryParams) {
    isLoading.value = true;

    try {
      if (params) {
        availableQuery.value = {
          ...availableQuery.value,
          ...params,
        };
      }

      const result = await apiRequest<Delivery[]>("/deliveries", {
        query: {
          ...availableQuery.value,
          // Backend can interpret this sentinel to return only deliveries
          // without an assigned driver. If the API shape changes, update here.
          driver_id: "unassigned",
        },
      });

      availableDeliveries.value = (result.data || []).filter(
        (entry) => !entry.driver_id,
      );
      totalAvailableDeliveries.value =
        result.total || result.meta?.total || availableDeliveries.value.length || 0;
      syncPagination(availablePagination.value, {
        ...result,
        data: availableDeliveries.value,
      });

      return {
        status: "success",
        message: result.message || "Available deliveries fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching available deliveries:", error);

      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to fetch available deliveries",
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
        driverDeliveries.value = driverDeliveries.value.map((entry) =>
          entry.id === id ? result.data : entry,
        );

        if (result.data.driver_id) {
          availableDeliveries.value = availableDeliveries.value.filter(
            (entry) => entry.id !== id,
          );
        } else if (availableDeliveries.value.some((entry) => entry.id === id)) {
          availableDeliveries.value = availableDeliveries.value.map((entry) =>
            entry.id === id ? result.data : entry,
          );
        }
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
    driverDeliveries,
    availableDeliveries,
    delivery,
    totalDeliveries,
    totalDriverDeliveries,
    totalAvailableDeliveries,
    isLoading,
    query,
    driverQuery,
    availableQuery,
    pagination,
    driverPagination,
    availablePagination,
    fetchDeliveries,
    fetchDriverDeliveries,
    fetchAvailableDeliveries,
    fetchDeliveryById,
    createDelivery,
    updateDelivery,
  };
});
