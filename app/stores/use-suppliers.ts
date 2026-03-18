import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  FetchSupplierParams,
  Supplier,
  SupplierPagination,
} from "~/types/supplier";
import type { H3Response } from "~/types/h3Response";
import { suppliers as seedSuppliers } from "~/seeds/suppliers";
import { downloadText } from "~/utils/documents";

type SupplierMeta = {
  status?: "active" | "inactive";
  payment_terms?: string;
};

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
  const supplierMeta = ref<Record<string, SupplierMeta>>({});

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

      const term = query.value.q?.trim().toLowerCase();
      if (term) {
        filtered = filtered.filter((s) =>
          [
            s.id ?? "",
            s.name ?? "",
            s.contact_name ?? "",
            s.email ?? "",
            s.phone ?? "",
            s.address ?? "",
          ]
            .join(" ")
            .toLowerCase()
            .includes(term),
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

  const createSupplier = async (
    payload: Omit<Supplier, "id" | "created_at" | "updated_at">,
  ): Promise<H3Response<Supplier>> => {
    try {
      isLoading.value = true;
      const now = new Date().toISOString();
      const created: Supplier = {
        ...payload,
        id: `sup-${Date.now()}`,
        created_at: now,
        updated_at: now,
      };

      allSuppliers.value = [created, ...allSuppliers.value];
      await fetchSuppliers();

      return buildOkResponse(created, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Supplier>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const updateSupplier = async (
    id: string,
    payload: Partial<Supplier>,
  ): Promise<H3Response<Supplier | null>> => {
    try {
      isLoading.value = true;
      const index = allSuppliers.value.findIndex((s) => s.id === id);

      if (index === -1) {
        return buildOkResponse(null, 0);
      }

      const updated: Supplier = {
        ...allSuppliers.value[index],
        ...payload,
        id,
        updated_at: new Date().toISOString(),
      };

      allSuppliers.value.splice(index, 1, updated);

      if (supplier.value?.id === id) {
        supplier.value = updated;
      }

      await fetchSuppliers();

      return buildOkResponse(updated, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Supplier | null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const setSupplierStatus = (id: string, status: SupplierMeta["status"]) => {
    supplierMeta.value = {
      ...supplierMeta.value,
      [id]: {
        ...(supplierMeta.value[id] ?? {}),
        status,
      },
    };
  };

  const updateSupplierPaymentTerms = (id: string, terms: string) => {
    supplierMeta.value = {
      ...supplierMeta.value,
      [id]: {
        ...(supplierMeta.value[id] ?? {}),
        payment_terms: terms,
      },
    };
  };

  const duplicateSupplier = async (
    id: string,
  ): Promise<H3Response<Supplier | null>> => {
    try {
      isLoading.value = true;
      const current = allSuppliers.value.find((item) => item.id === id);
      if (!current) return buildOkResponse(null, 0);

      const now = new Date().toISOString();
      const duplicated: Supplier = {
        ...current,
        id: `sup-${Date.now()}`,
        name: `${current.name ?? "Supplier"} (Copy)`,
        created_at: now,
        updated_at: now,
      };

      allSuppliers.value = [duplicated, ...allSuppliers.value];
      await fetchSuppliers();

      return buildOkResponse(duplicated, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Supplier | null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const exportSupplier = (id: string) => {
    const current = allSuppliers.value.find((item) => item.id === id);
    if (!current) return;
    const payload = JSON.stringify(current, null, 2);
    downloadText(`supplier-${id}.json`, payload, "application/json");
  };

  const deleteSupplier = async (id: string): Promise<H3Response<null>> => {
    try {
      isLoading.value = true;
      allSuppliers.value = allSuppliers.value.filter((s) => s.id !== id);

      if (supplier.value?.id === id) {
        supplier.value = null;
      }

      await fetchSuppliers();

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
    return await fetchSuppliers();
  };

  const setPage = async (page: number) => {
    query.value.page = page;
    return await fetchSuppliers();
  };

  return {
    supplier,
    suppliers,
    supplierMeta,
    query,
    pagination,
    isLoading,
    error,
    fetchSuppliers,
    fetchSupplierById,
    createSupplier,
    updateSupplier,
    deleteSupplier,
    setSupplierStatus,
    updateSupplierPaymentTerms,
    duplicateSupplier,
    exportSupplier,
    setSearch,
    setPage,
  };
});
