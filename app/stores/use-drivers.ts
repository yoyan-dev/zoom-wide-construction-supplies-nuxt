import { ref } from "vue";
import { defineStore } from "pinia";
import type { Driver, FetchDriverParams } from "~/types/driver";
import type { PaginationMeta } from "~/types/pagination";
import type { StoreResponse } from "~/types/store-response";
import { apiRequest } from "~/utils/api";

export const useDriverStore = defineStore("drivers", () => {
  const drivers = ref<Driver[]>([]);
  const driver = ref<Driver | null>(null);
  const totalDrivers = ref(0);
  const isLoading = ref(false);

  const query = ref<FetchDriverParams>({
    q: "",
    page: 1,
  });

  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  async function fetchDrivers(params?: FetchDriverParams) {
    isLoading.value = true;

    try {
      if (params) {
        query.value = {
          ...query.value,
          ...params,
        };
      }

      const result = await apiRequest<Driver[]>("/drivers", {
        query: query.value,
      });

      drivers.value = result.data || [];
      totalDrivers.value = result.total || result.meta?.total || result.data?.length || 0;

      pagination.value = {
        page: result.meta?.page || 1,
        limit: result.meta?.limit || 10,
        total: result.meta?.total || result.total || result.data?.length || 0,
        totalPages: result.meta?.totalPages || 0,
      };

      return {
        status: "success",
        message: result.message || "Drivers fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching drivers:", error);

      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to fetch drivers",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchDriverById(id: string) {
    isLoading.value = true;

    try {
      const result = await apiRequest<Driver>(`/drivers/${id}`);
      driver.value = result.data;

      return {
        status: "success",
        message: result.message || "Driver fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching driver:", error);
      driver.value = null;

      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to fetch driver",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    drivers,
    driver,
    totalDrivers,
    isLoading,
    query,
    pagination,
    fetchDrivers,
    fetchDriverById,
  };
});
