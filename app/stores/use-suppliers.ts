import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  FetchSupplierParams,
  Supplier,
  SupplierPagination,
} from "~/types/supplier";
import type { H3Response } from "~/types/h3Response";
import { suppliers as seedSuppliers } from "~/seeds/suppliers";

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

export const useSupplierStore = defineStore("suppliers", () => {
  const error = ref<Error | null>(null);
  const supplier = ref<Supplier | null>(null);
  const isLoading = ref(false);

  const allSuppliers = ref<Supplier[]>([...seedSuppliers]);
  const suppliers = ref<Supplier[]>([]);

  const query = ref<FetchSupplierParams>({
    q: "",
    page: 1,
  });

  const pagination = ref<SupplierPagination>({
    page: 1,
    limit: seedSuppliers.length,
    total: 0,
    total_pages: 0,
  });

  const fetchSuppliers = async (): Promise<H3Response<Supplier[]>> => {
    try {
      isLoading.value = true;

      let filtered = [...allSuppliers.value];

      if (query.value.q) {
        filtered = filtered.filter((s) =>
          s.name?.toLowerCase().includes(query.value.q!.toLowerCase()),
        );
      }

      const start = (query.value.page! - 1) * pagination.value.limit!;
      const end = start + pagination.value.limit!;

      pagination.value.total = filtered.length;
      pagination.value.total_pages = Math.ceil(
        filtered.length / pagination.value.limit!,
      );
      pagination.value.page = query.value.page;

      suppliers.value = filtered.slice(start, end);
      return buildOkResponse(suppliers.value, pagination.value.total);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Supplier[]>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchSupplierById = async (
    id: string,
  ): Promise<H3Response<Supplier | null>> => {
    try {
      const found = allSuppliers.value.find((s) => s.id === id);

      if (!found) {
        supplier.value = null;
        return buildOkResponse(null, 0);
      }

      supplier.value = found;
      return buildOkResponse(supplier.value, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Supplier | null>(err);
    }
  };

  const setSearch = async (value: string) => {
    query.value.q = value;
    query.value.page = 1;
    return await fetchSuppliers();
  };

  const setPage = async (page: number) => {
    query.value.page = page;
    return await fetchSuppliers();
  };

  return {
    supplier,
    suppliers,
    query,
    pagination,
    isLoading,
    error,
    fetchSuppliers,
    fetchSupplierById,
    setSearch,
    setPage,
  };
});
