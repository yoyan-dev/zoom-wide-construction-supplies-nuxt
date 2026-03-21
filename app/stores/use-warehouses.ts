import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type {
  FetchWarehouseParams,
  Warehouse,
  WarehousePagination,
  WarehouseStatus,
} from "~/types/warehouse";
import type { H3Response } from "~/types/h3Response";
import {
  apiRequest,
  buildErrorResponse,
  buildOkResponse,
  DEFAULT_API_PAGE_LIMIT,
  getTotalPages,
  toErrorMessage,
} from "~/utils/api";

export const useWarehouseStore = defineStore("warehouses", () => {
  const error = ref<string | null>(null);
  const warehouse = ref<Warehouse | null>(null);

  const allWarehouses = ref<Warehouse[]>([]);
  const warehouses = ref<Warehouse[]>([]);

  const query = ref<FetchWarehouseParams>({
    q: "",
    status: "",
    page: 1,
  });

  const pagination = ref<WarehousePagination>({
    page: 1,
    limit: DEFAULT_API_PAGE_LIMIT,
    total: 0,
    total_pages: 0,
  });
  const isFetchingWarehouses = ref(false);
  const isFetchingWarehouse = ref(false);

  const isMutating = ref(false);
  const isLoading = computed(
    () =>
      isFetchingWarehouses.value ||
      isFetchingWarehouse.value ||
      isMutating.value,
  );

  const syncPagination = (total: number, limit: number) => {
    pagination.value = {
      page: query.value.page ?? 1,
      limit,
      total,
      total_pages: getTotalPages(total, limit),
    };
  };

  const setCachedWarehouse = (value: Warehouse) => {
    const next = allWarehouses.value.filter((item) => item.id !== value.id);
    allWarehouses.value = [value, ...next];
  };

  const fetchWarehouses = async (): Promise<H3Response<Warehouse[]>> => {
    try {
      error.value = null;
      isFetchingWarehouses.value = true;
      const limit = pagination.value.limit ?? DEFAULT_API_PAGE_LIMIT;
      const response = await apiRequest<Warehouse[]>("/warehouses", {
        query: {
          q: query.value.q,
          status: query.value.status,
          page: query.value.page ?? 1,
          limit,
        },
      });
      const items = response.data ?? [];
      const total = response.total ?? items.length;

      allWarehouses.value = items;
      warehouses.value = items;
      syncPagination(total, limit);

      if (warehouse.value?.id) {
        warehouse.value =
          items.find((item) => item.id === warehouse.value?.id) ?? warehouse.value;
      }

      return buildOkResponse(warehouses.value, total);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Warehouse[]>(err);
    } finally {
      isFetchingWarehouses.value = false;
    }
  };

  const fetchWarehouseById = async (
    id: string,
  ): Promise<H3Response<Warehouse | null>> => {
    try {
      error.value = null;
      isFetchingWarehouse.value = true;
      const cached = allWarehouses.value.find((item) => item.id === id) ?? null;

      if (cached) {
        warehouse.value = cached;
        return buildOkResponse(warehouse.value, 1);
      }

      const response = await apiRequest<Warehouse | null>(`/warehouses/${id}`);
      warehouse.value = response.data ?? null;

      if (warehouse.value) {
        setCachedWarehouse(warehouse.value);
      }

      return buildOkResponse(warehouse.value, warehouse.value ? 1 : 0);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Warehouse | null>(err);
    } finally {
      isFetchingWarehouse.value = false;
    }
  };

  const createWarehouse = async (
    payload: Omit<Warehouse, "id" | "created_at" | "updated_at">,
  ): Promise<H3Response<Warehouse>> => {
    try {
      error.value = null;
      isMutating.value = true;

      const response = await apiRequest<Warehouse>("/warehouses", {
        method: "POST",
        body: payload,
      });
      const created = response.data as Warehouse;

      setCachedWarehouse(created);
      warehouse.value = created;
      await fetchWarehouses();

      return buildOkResponse(created, 1);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Warehouse>(err);
    } finally {
      isMutating.value = false;
    }
  };

  const updateWarehouse = async (
    id: string,
    payload: Partial<Warehouse>,
  ): Promise<H3Response<Warehouse | null>> => {
    try {
      error.value = null;
      isMutating.value = true;

      const response = await apiRequest<Warehouse | null>(`/warehouses/${id}`, {
        method: "PATCH",
        body: payload,
      });
      const updated = response.data ?? null;

      if (!updated) {
        return buildOkResponse(null, 0);
      }

      setCachedWarehouse(updated);

      if (warehouse.value?.id === id) {
        warehouse.value = updated;
      }

      await fetchWarehouses();
      return buildOkResponse(updated, 1);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Warehouse | null>(err);
    } finally {
      isMutating.value = false;
    }
  };

  const deleteWarehouse = async (id: string): Promise<H3Response<null>> => {
    try {
      error.value = null;
      isMutating.value = true;

      await apiRequest<null>(`/warehouses/${id}`, {
        method: "DELETE",
      });

      allWarehouses.value = allWarehouses.value.filter((item) => item.id !== id);
      warehouses.value = warehouses.value.filter((item) => item.id !== id);

      if (warehouse.value?.id === id) {
        warehouse.value = null;
      }

      await fetchWarehouses();
      return buildOkResponse(null, 1);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<null>(err);
    } finally {
      isMutating.value = false;
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
