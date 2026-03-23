import { defineStore } from "pinia";
import { computed, ref } from "vue";
import type {
  FetchSupplierParams,
  Supplier,
  SupplierPagination,
} from "~/types/supplier";
import type { H3Response } from "~/types/h3Response";
import { downloadText } from "~/utils/documents";
import {
  apiRequest,
  buildErrorResponse,
  buildOkResponse,
  DEFAULT_API_PAGE_LIMIT,
  getTotalPages,
  toErrorMessage,
} from "~/utils/api";

type SupplierMeta = {
  status?: "active" | "inactive";
  payment_terms?: string;
};

export const useSupplierStore = defineStore("suppliers", () => {
  const error = ref<string | null>(null);
  const supplier = ref<Supplier | null>(null);

  const allSuppliers = ref<Supplier[]>([]);
  const suppliers = ref<Supplier[]>([]);
  const supplierMeta = ref<Record<string, SupplierMeta>>({});

  const query = ref<FetchSupplierParams>({
    q: "",
    page: 1,
  });

  const pagination = ref<SupplierPagination>({
    page: 1,
    limit: DEFAULT_API_PAGE_LIMIT,
    total: 0,
    total_pages: 0,
  });
  const isFetchingSuppliers = ref(false);
  const isFetchingSupplier = ref(false);

  const isMutating = ref(false);
  const isLoading = computed(
    () =>
      isFetchingSuppliers.value ||
      isFetchingSupplier.value ||
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

  const setCachedSupplier = (value: Supplier) => {
    const next = allSuppliers.value.filter((item) => item.id !== value.id);
    allSuppliers.value = [value, ...next];
  };

  const fetchSuppliers = async (): Promise<H3Response<Supplier[]>> => {
    try {
      error.value = null;
      isFetchingSuppliers.value = true;
      const limit = pagination.value.limit ?? DEFAULT_API_PAGE_LIMIT;
      const response = await apiRequest<Supplier[]>("/suppliers", {
        query: {
          q: query.value.q,
          page: query.value.page ?? 1,
          limit,
        },
      });
      const items = response.data ?? [];
      const total = response.total ?? items.length;

      allSuppliers.value = items;
      suppliers.value = items;
      syncPagination(total, limit);

      if (supplier.value?.id) {
        supplier.value =
          items.find((item) => item.id === supplier.value?.id) ?? supplier.value;
      }

      return buildOkResponse(suppliers.value, total);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Supplier[]>(err);
    } finally {
      isFetchingSuppliers.value = false;
    }
  };

  const fetchSupplierById = async (
    id: string,
  ): Promise<H3Response<Supplier | null>> => {
    try {
      error.value = null;
      isFetchingSupplier.value = true;
      const cached = allSuppliers.value.find((item) => item.id === id) ?? null;

      if (cached) {
        supplier.value = cached;
        return buildOkResponse(supplier.value, 1);
      }

      const response = await apiRequest<Supplier | null>(`/suppliers/${id}`);
      supplier.value = response.data ?? null;

      if (supplier.value) {
        setCachedSupplier(supplier.value);
      }

      return buildOkResponse(supplier.value, supplier.value ? 1 : 0);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Supplier | null>(err);
    } finally {
      isFetchingSupplier.value = false;
    }
  };

  const createSupplier = async (
    payload: Omit<Supplier, "id" | "created_at" | "updated_at">,
  ): Promise<H3Response<Supplier>> => {
    try {
      error.value = null;
      isMutating.value = true;

      const response = await apiRequest<Supplier>("/suppliers", {
        method: "POST",
        body: payload,
      });
      const created = response.data as Supplier;

      setCachedSupplier(created);
      supplier.value = created;
      await fetchSuppliers();

      return buildOkResponse(created, 1);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Supplier>(err);
    } finally {
      isMutating.value = false;
    }
  };

  const updateSupplier = async (
    id: string,
    payload: Partial<Supplier>,
  ): Promise<H3Response<Supplier | null>> => {
    try {
      error.value = null;
      isMutating.value = true;

      const response = await apiRequest<Supplier | null>(`/suppliers/${id}`, {
        method: "PATCH",
        body: payload,
      });
      const updated = response.data ?? null;

      if (!updated) {
        return buildOkResponse(null, 0);
      }

      setCachedSupplier(updated);

      if (supplier.value?.id === id) {
        supplier.value = updated;
      }

      await fetchSuppliers();

      return buildOkResponse(updated, 1);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Supplier | null>(err);
    } finally {
      isMutating.value = false;
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
      const current = allSuppliers.value.find((item) => item.id === id);

      if (!current) {
        return buildOkResponse(null, 0);
      }

      const response = await createSupplier({
        name: `${current.name ?? "Supplier"} (Copy)`,
        contact_name: current.contact_name,
        phone: current.phone,
        email: current.email,
        address: current.address,
      });

      return buildOkResponse(response.data ?? null, response.total ?? 0);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Supplier | null>(err);
    }
  };

  const exportSupplier = (id: string) => {
    const current =
      allSuppliers.value.find((item) => item.id === id) ??
      (supplier.value?.id === id ? supplier.value : null);
    if (!current) return;
    const payload = JSON.stringify(current, null, 2);
    downloadText(`supplier-${id}.json`, payload, "application/json");
  };

  const deleteSupplier = async (id: string): Promise<H3Response<null>> => {
    try {
      error.value = null;
      isMutating.value = true;

      await apiRequest<null>(`/suppliers/${id}`, {
        method: "DELETE",
      });

      allSuppliers.value = allSuppliers.value.filter((item) => item.id !== id);
      suppliers.value = suppliers.value.filter((item) => item.id !== id);

      if (supplier.value?.id === id) {
        supplier.value = null;
      }

      await fetchSuppliers();

      return buildOkResponse(null, 1);
    } catch (err: unknown) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<null>(err);
    } finally {
      isMutating.value = false;
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
