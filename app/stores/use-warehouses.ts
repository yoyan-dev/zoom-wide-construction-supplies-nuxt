import { ref } from "vue";
import { defineStore } from "pinia";
import type { PaginationMeta } from "~/types/pagination";
import type { StoreResponse } from "~/types/store-response";
import type {
  CreateWarehousePayload,
  FetchWarehouseParams,
  UpdateWarehousePayload,
  Warehouse,
} from "~/types/warehouse";
import { apiRequest, apiRequestRaw } from "~/utils/api";

const buildWarehouseFormData = (payload: CreateWarehousePayload) => {
  const formData = new FormData();
  formData.append("name", payload.name);
  formData.append("address", payload.address);
  formData.append("capacity", String(payload.capacity));

  if (payload.manager_id) {
    formData.append("manager_id", payload.manager_id);
  }

  if (payload.status) {
    formData.append("status", payload.status);
  }

  return formData;
};

export const useWarehouseStore = defineStore("warehouses", () => {
  const warehouses = ref<Warehouse[]>([]);
  const warehouse = ref<Warehouse | null>(null);
  const totalWarehouses = ref(0);
  const isLoading = ref(false);

  const query = ref<FetchWarehouseParams>({
    q: "",
    status: "",
    page: 1,
  });

  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const syncWarehouseRecord = (nextWarehouse: Warehouse) => {
    warehouse.value = nextWarehouse;
    warehouses.value = warehouses.value.map((entry) =>
      entry.id === nextWarehouse.id ? nextWarehouse : entry,
    );
  };

  async function fetchWarehouses(params?: FetchWarehouseParams) {
    isLoading.value = true;

    try {
      if (params) {
        query.value = {
          ...query.value,
          ...params,
        };
      }

      const result = await apiRequest<Warehouse[]>("/warehouses", {
        query: query.value,
      });

      warehouses.value = result.data || [];
      totalWarehouses.value =
        result.total || result.meta?.total || result.data?.length || 0;

      pagination.value = {
        page: result.meta?.page || 1,
        limit: result.meta?.limit || query.value.limit || 10,
        total: result.meta?.total || result.total || result.data?.length || 0,
        totalPages: result.meta?.totalPages || 0,
      };

      return {
        status: "success",
        message: result.message || "Warehouses fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching warehouses:", error);

      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to fetch warehouses",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchWarehouseById(id: string) {
    isLoading.value = true;

    try {
      const result = await apiRequest<Warehouse>(`/warehouses/${id}`);
      warehouse.value = result.data;

      return {
        status: "success",
        message: result.message || "Warehouse fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching warehouse:", error);
      warehouse.value = null;

      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to fetch warehouse",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function addWarehouse(
    payload: CreateWarehousePayload,
  ): Promise<StoreResponse<Warehouse>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Warehouse>("/warehouses", {
        method: "POST",
        body: buildWarehouseFormData(payload),
      });

      if (result.data) {
        warehouses.value = [
          result.data,
          ...warehouses.value.filter((entry) => entry.id !== result.data?.id),
        ];
        totalWarehouses.value += 1;
      }

      return {
        status: "success",
        message: result.message || "Warehouse created successfully",
        statusMessage: result.statusMessage || "created",
        data: result.data || null,
      };
    } catch (error) {
      console.error("Error adding warehouse:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to add warehouse",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateWarehouse(
    id: string,
    payload: UpdateWarehousePayload,
  ): Promise<StoreResponse<Warehouse>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Warehouse>(`/warehouses/${id}`, {
        method: "PATCH",
        body: payload,
      });

      if (result.data) {
        syncWarehouseRecord(result.data);
      }

      return {
        status: "success",
        message: result.message || "Warehouse updated successfully",
        statusMessage: result.statusMessage || "accepted",
        data: result.data || null,
      };
    } catch (error) {
      console.error("Error updating warehouse:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to update warehouse",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteWarehouse(id: string): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const { data: result, ok } = await apiRequestRaw<null>(
        `/warehouses/${id}`,
        {
          method: "DELETE",
        },
      );

      if (!ok || (result && result.status === "error")) {
        throw new Error(result?.message || "Failed to delete warehouse");
      }

      warehouses.value = warehouses.value.filter((entry) => entry.id !== id);
      totalWarehouses.value = Math.max(0, totalWarehouses.value - 1);

      if (warehouse.value?.id === id) {
        warehouse.value = null;
      }

      return {
        status: "success",
        message: result?.message || "Warehouse deleted successfully",
        statusMessage: result?.statusMessage || "no content",
      };
    } catch (error) {
      console.error("Error deleting warehouse:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to delete warehouse",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    warehouses,
    warehouse,
    totalWarehouses,
    isLoading,
    query,
    pagination,
    fetchWarehouses,
    fetchWarehouseById,
    addWarehouse,
    updateWarehouse,
    deleteWarehouse,
  };
});
