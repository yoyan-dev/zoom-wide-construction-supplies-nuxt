import { ref } from "vue";
import { defineStore } from "pinia";
import type { PaginationMeta } from "~/types/pagination";
import type { StoreResponse } from "~/types/store-response";
import type {
  CreateInventoryMovementPayload,
  FetchInventoryParams,
  InventoryLog,
} from "~/types/inventory";
import { apiRequest } from "~/utils/api";

export const useInventoryStore = defineStore("inventory", () => {
  const logs = ref<InventoryLog[]>([]);
  const totalLogs = ref(0);
  const isLoading = ref(false);

  const query = ref<FetchInventoryParams>({
    q: "",
    page: 1,
    limit: 100,
  });

  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 100,
    total: 0,
    totalPages: 0,
  });

  async function fetchInventoryLogs(params?: FetchInventoryParams) {
    isLoading.value = true;

    try {
      if (params) {
        query.value = {
          ...query.value,
          ...params,
        };
      }

      const result = await apiRequest<InventoryLog[]>("/inventory/movements", {
        query: query.value,
      });

      logs.value = result.data || [];
      totalLogs.value = result.total || result.meta?.total || result.data?.length || 0;

      pagination.value = {
        page: result.meta?.page || 1,
        limit: result.meta?.limit || query.value.limit || 100,
        total: result.meta?.total || result.total || result.data?.length || 0,
        totalPages: result.meta?.totalPages || 0,
      };

      return {
        status: "success",
        message: result.message || "Inventory movements fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching inventory movements:", error);

      return {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to fetch inventory movements",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function createInventoryMovement(
    payload: CreateInventoryMovementPayload,
  ): Promise<StoreResponse<InventoryLog>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<InventoryLog>("/inventory", {
        method: "POST",
        body: payload,
      });

      if (result.data) {
        logs.value = [result.data, ...logs.value];
        totalLogs.value += 1;
      }

      return {
        status: "success",
        message: result.message || "Inventory adjustment recorded successfully",
        statusMessage: result.statusMessage || "created",
        data: result.data || null,
      };
    } catch (error) {
      console.error("Error creating inventory movement:", error);

      return {
        status: "error",
        message:
          error instanceof Error
            ? error.message
            : "Failed to create inventory movement",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    logs,
    totalLogs,
    isLoading,
    query,
    pagination,
    fetchInventoryLogs,
    createInventoryMovement,
  };
});
