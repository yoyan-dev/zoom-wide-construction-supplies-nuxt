import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  FetchWarehouseParams,
  Warehouse,
  WarehousePagination,
  WarehouseStatus,
} from "~/types/warehouse";
import type { H3Response } from "~/types/h3Response";
import { warehouses as seedWarehouses } from "~/seeds/warehouses";

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

export const useWarehouseStore = defineStore("warehouses", () => {
  const error = ref<Error | null>(null);
  const warehouse = ref<Warehouse | null>(null);
  const isLoading = ref(false);

  const allWarehouses = ref<Warehouse[]>([...seedWarehouses]);
  const warehouses = ref<Warehouse[]>([]);

  const query = ref<FetchWarehouseParams>({
    q: "",
    status: "",
    page: 1,
  });

  const pagination = ref<WarehousePagination>({
    page: 1,
    limit: seedWarehouses.length,
    total: 0,
    total_pages: 0,
  });

  const fetchWarehouses = async (): Promise<H3Response<Warehouse[]>> => {
    try {
      isLoading.value = true;

      let filtered = [...allWarehouses.value];

      if (query.value.q) {
        const term = query.value.q.toLowerCase();
        filtered = filtered.filter((item) => {
          return [item.name, item.address, item.id]
            .join(" ")
            .toLowerCase()
            .includes(term);
        });
      }

      if (query.value.status) {
        filtered = filtered.filter((item) => item.status === query.value.status);
      }

      const start = (query.value.page! - 1) * pagination.value.limit!;
      const end = start + pagination.value.limit!;

      pagination.value.total = filtered.length;
      pagination.value.total_pages = Math.ceil(
        filtered.length / pagination.value.limit!,
      );
      pagination.value.page = query.value.page;

      warehouses.value = filtered.slice(start, end);
      return buildOkResponse(warehouses.value, pagination.value.total);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Warehouse[]>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchWarehouseById = async (
    id: string,
  ): Promise<H3Response<Warehouse | null>> => {
    try {
      const found = allWarehouses.value.find((item) => item.id === id);

      if (!found) {
        warehouse.value = null;
        return buildOkResponse(null, 0);
      }

      warehouse.value = found;
      return buildOkResponse(warehouse.value, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Warehouse | null>(err);
    }
  };

  const createWarehouse = async (
    payload: Omit<Warehouse, "id" | "created_at" | "updated_at">,
  ): Promise<H3Response<Warehouse>> => {
    try {
      isLoading.value = true;
      const now = new Date().toISOString();
      const created: Warehouse = {
        ...payload,
        id: `wh-${Date.now()}`,
        created_at: now,
        updated_at: now,
      };

      allWarehouses.value = [created, ...allWarehouses.value];
      await fetchWarehouses();

      return buildOkResponse(created, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Warehouse>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const updateWarehouse = async (
    id: string,
    payload: Partial<Warehouse>,
  ): Promise<H3Response<Warehouse | null>> => {
    try {
      isLoading.value = true;
      const index = allWarehouses.value.findIndex((item) => item.id === id);

      if (index === -1) return buildOkResponse(null, 0);

      const current = allWarehouses.value[index];
      if (!current) return buildOkResponse(null, 0);

      const updated: Warehouse = {
        ...current,
        ...payload,
        id,
        updated_at: new Date().toISOString(),
      };

      allWarehouses.value.splice(index, 1, updated);

      if (warehouse.value?.id === id) {
        warehouse.value = updated;
      }

      await fetchWarehouses();
      return buildOkResponse(updated, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Warehouse | null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const deleteWarehouse = async (id: string): Promise<H3Response<null>> => {
    try {
      isLoading.value = true;
      allWarehouses.value = allWarehouses.value.filter((item) => item.id !== id);

      if (warehouse.value?.id === id) {
        warehouse.value = null;
      }

      await fetchWarehouses();
      return buildOkResponse(null, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const setWarehouseStatus = async (id: string, status: WarehouseStatus) => {
    return await updateWarehouse(id, { status });
  };

  const assignWarehouseManager = async (id: string, managerId: string | null) => {
    return await updateWarehouse(id, { manager_id: managerId });
  };

  const setSearch = async (value: string) => {
    query.value.q = value;
    query.value.page = 1;
    return await fetchWarehouses();
  };

  const setFilter = async (filters: Partial<FetchWarehouseParams>) => {
    query.value = {
      ...query.value,
      ...filters,
      page: 1,
    };

    return await fetchWarehouses();
  };

  const setPage = async (page: number) => {
    query.value.page = page;
    return await fetchWarehouses();
  };

  return {
    warehouse,
    warehouses,
    query,
    pagination,
    isLoading,
    error,
    fetchWarehouses,
    fetchWarehouseById,
    createWarehouse,
    updateWarehouse,
    deleteWarehouse,
    setWarehouseStatus,
    assignWarehouseManager,
    setSearch,
    setFilter,
    setPage,
  };
});
