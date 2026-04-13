import { ref } from "vue";
import { defineStore } from "pinia";
import type {
  CreateDriverPayload,
  Driver,
  FetchDriverParams,
  UpdateDriverPayload,
} from "~/types/driver";
import type { PaginationMeta } from "~/types/pagination";
import type { StoreResponse } from "~/types/store-response";
import { apiRequest, apiRequestRaw } from "~/utils/api";

export const useDriverStore = defineStore("drivers", () => {
  const drivers = ref<Driver[]>([]);
  const driver = ref<Driver | null>(null);
  const totalDrivers = ref(0);
  const isLoading = ref(false);

  const query = ref<FetchDriverParams>({
    q: "",
    page: 1,
    limit: 10,
  });

  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  const syncDriverRecord = (nextDriver: Driver) => {
    driver.value = nextDriver;
    drivers.value = drivers.value.map((entry) =>
      entry.id === nextDriver.id ? nextDriver : entry,
    );
  };

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
        limit: result.meta?.limit || query.value.limit || 10,
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

  async function addDriver(
    payload: CreateDriverPayload,
  ): Promise<StoreResponse<Driver>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Driver>("/drivers", {
        method: "POST",
        body: payload,
      });

      if (result.data) {
        drivers.value = [
          result.data,
          ...drivers.value.filter((entry) => entry.id !== result.data?.id),
        ];
        totalDrivers.value += 1;
      }

      return {
        status: "success",
        message: result.message || "Driver created successfully",
        statusMessage: result.statusMessage || "created",
        data: result.data || null,
      };
    } catch (error) {
      console.error("Error adding driver:", error);
      return {
        status: "error",
        message: error instanceof Error ? error.message : "Failed to add driver",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateDriver(
    id: string,
    payload: UpdateDriverPayload,
  ): Promise<StoreResponse<Driver>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Driver>(`/drivers/${id}`, {
        method: "PATCH",
        body: payload,
      });

      if (result.data) {
        syncDriverRecord(result.data);
      }

      return {
        status: "success",
        message: result.message || "Driver updated successfully",
        statusMessage: result.statusMessage || "accepted",
        data: result.data || null,
      };
    } catch (error) {
      console.error("Error updating driver:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to update driver",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteDriver(id: string): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const { data: result, ok } = await apiRequestRaw<null>(`/drivers/${id}`, {
        method: "DELETE",
      });

      if (!ok || (result && result.status === "error")) {
        throw new Error(result?.message || "Failed to delete driver");
      }

      drivers.value = drivers.value.filter((entry) => entry.id !== id);
      totalDrivers.value = Math.max(0, totalDrivers.value - 1);

      if (driver.value?.id === id) {
        driver.value = null;
      }

      return {
        status: "success",
        message: result?.message || "Driver deleted successfully",
        statusMessage: result?.statusMessage || "no content",
      };
    } catch (error) {
      console.error("Error deleting driver:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to delete driver",
        statusMessage: "internal server error",
      };
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
    addDriver,
    updateDriver,
    deleteDriver,
  };
});
