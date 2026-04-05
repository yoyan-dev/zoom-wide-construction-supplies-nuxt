import { ref } from "vue";
import { defineStore } from "pinia";
import type { PaginationMeta } from "~/types/pagination";
import type { StoreResponse } from "~/types/store-response";
import type { FetchWarehouseParams, Warehouse } from "~/types/warehouse";
import { apiRequest } from "~/utils/api";

export const useWarehouseStore = defineStore("warehouses", () => {
  const warehouses = ref<Warehouse[]>([]);
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
        limit: result.meta?.limit || 10,
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

  return {
    warehouses,
    totalWarehouses,
    isLoading,
    query,
    pagination,
    fetchWarehouses,
  };
});
