import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  FetchInventoryParams,
  InventoryLog,
  InventoryPagination,
} from "~/types/inventory";
import type { H3Response } from "~/types/h3Response";
import { inventoryLogs as seedInventoryLogs } from "~/seeds/inventory";
import { products as seedProducts } from "~/seeds/products";

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

export const useInventoryStore = defineStore("inventory", () => {
  const error = ref<Error | null>(null);
  const log = ref<InventoryLog | null>(null);
  const isLoading = ref(false);

  const allLogs = ref<InventoryLog[]>([...seedInventoryLogs]);
  const logs = ref<InventoryLog[]>([]);

  const query = ref<FetchInventoryParams>({
    q: "",
    movement_type: "",
    product_id: "",
    page: 1,
  });

  const pagination = ref<InventoryPagination>({
    page: 1,
    limit: seedInventoryLogs.length,
    total: 0,
    total_pages: 0,
  });

  const fetchInventoryLogs = async (): Promise<H3Response<InventoryLog[]>> => {
    try {
      isLoading.value = true;

      let filtered = [...allLogs.value];

      if (query.value.q) {
        const q = query.value.q.toLowerCase();
        const productMap = new Map(
          seedProducts.map((product) => [
            product.id ?? "",
            { name: product.name ?? "", sku: product.sku ?? "" },
          ]),
        );
        filtered = filtered.filter((entry) => {
          const note = entry.note ?? "";
          const refType = entry.reference_type ?? "";
          const refId = entry.reference_id ?? "";
          const product = productMap.get(entry.product_id);
          const productName = product?.name ?? "";
          const productSku = product?.sku ?? "";
          return (
            entry.id.toLowerCase().includes(q) ||
            entry.product_id.toLowerCase().includes(q) ||
            note.toLowerCase().includes(q) ||
            refType.toLowerCase().includes(q) ||
            refId.toLowerCase().includes(q) ||
            productName.toLowerCase().includes(q) ||
            productSku.toLowerCase().includes(q)
          );
        });
      }

      if (query.value.movement_type) {
        filtered = filtered.filter(
          (entry) => entry.movement_type === query.value.movement_type,
        );
      }

      if (query.value.product_id) {
        filtered = filtered.filter(
          (entry) => entry.product_id === query.value.product_id,
        );
      }

      const start = (query.value.page! - 1) * pagination.value.limit!;
      const end = start + pagination.value.limit!;

      pagination.value.total = filtered.length;
      pagination.value.total_pages = Math.ceil(
        filtered.length / pagination.value.limit!,
      );
      pagination.value.page = query.value.page;

      logs.value = filtered.slice(start, end);
      return buildOkResponse(logs.value, pagination.value.total);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<InventoryLog[]>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchInventoryLogById = async (
    id: string,
  ): Promise<H3Response<InventoryLog | null>> => {
    try {
      const found = allLogs.value.find((entry) => entry.id === id);

      if (!found) {
        log.value = null;
        return buildOkResponse(null, 0);
      }

      log.value = found;
      return buildOkResponse(log.value, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<InventoryLog | null>(err);
    }
  };

  const createInventoryLog = async (
    payload: Omit<InventoryLog, "id" | "created_at">,
  ): Promise<H3Response<InventoryLog>> => {
    try {
      isLoading.value = true;
      const now = new Date().toISOString();
      const created: InventoryLog = {
        id: `inv-${Date.now()}`,
        product_id: payload.product_id,
        movement_type: payload.movement_type,
        quantity_change: payload.quantity_change,
        reference_type: payload.reference_type ?? null,
        reference_id: payload.reference_id ?? null,
        note: payload.note ?? null,
        created_by: payload.created_by ?? null,
        created_at: now,
      };

      allLogs.value = [created, ...allLogs.value];
      await fetchInventoryLogs();

      return buildOkResponse(created, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<InventoryLog>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const updateInventoryLog = async (
    id: string,
    payload: Partial<InventoryLog>,
  ): Promise<H3Response<InventoryLog | null>> => {
    try {
      isLoading.value = true;
      const index = allLogs.value.findIndex((entry) => entry.id === id);

      if (index === -1) {
        return buildOkResponse(null, 0);
      }

      const updated: InventoryLog = {
        ...allLogs.value[index],
        ...payload,
        id,
      };

      allLogs.value.splice(index, 1, updated);

      if (log.value?.id === id) {
        log.value = updated;
      }

      await fetchInventoryLogs();

      return buildOkResponse(updated, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<InventoryLog | null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const deleteInventoryLog = async (id: string): Promise<H3Response<null>> => {
    try {
      isLoading.value = true;
      allLogs.value = allLogs.value.filter((entry) => entry.id !== id);

      if (log.value?.id === id) {
        log.value = null;
      }

      await fetchInventoryLogs();

      return buildOkResponse(null, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const setSearch = async (value: string) => {
    query.value.q = value;
    query.value.page = 1;
    return await fetchInventoryLogs();
  };

  const setFilter = async (filters: Partial<FetchInventoryParams>) => {
    query.value = {
      ...query.value,
      ...filters,
      page: 1,
    };

    return await fetchInventoryLogs();
  };

  const setPage = async (page: number) => {
    query.value.page = page;
    return await fetchInventoryLogs();
  };

  return {
    log,
    logs,
    query,
    pagination,
    isLoading,
    error,
    fetchInventoryLogs,
    fetchInventoryLogById,
    createInventoryLog,
    updateInventoryLog,
    deleteInventoryLog,
    setSearch,
    setFilter,
    setPage,
  };
});
