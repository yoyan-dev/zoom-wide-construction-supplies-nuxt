import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  FetchInventoryParams,
  InventoryLog,
  InventoryPagination,
} from "~/types/inventory";
import type { H3Response } from "~/types/h3Response";
import { inventoryLogs as seedInventoryLogs } from "~/seeds/inventory";

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
        filtered = filtered.filter((entry) => {
          const note = entry.note ?? "";
          const refType = entry.reference_type ?? "";
          const refId = entry.reference_id ?? "";
          return (
            entry.id.toLowerCase().includes(q) ||
            entry.product_id.toLowerCase().includes(q) ||
            note.toLowerCase().includes(q) ||
            refType.toLowerCase().includes(q) ||
            refId.toLowerCase().includes(q)
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
    setSearch,
    setFilter,
    setPage,
  };
});
