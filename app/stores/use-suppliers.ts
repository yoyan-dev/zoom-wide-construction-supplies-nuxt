import { ref } from "vue";
import { defineStore } from "pinia";
import type {
  CreateSupplierPayload,
  FetchSupplierParams,
  Supplier,
  UpdateSupplierPayload,
} from "~/types/supplier";
import type { PaginationMeta } from "~/types/pagination";
import type { StoreResponse } from "~/types/store-response";
import { apiRequest, apiRequestRaw } from "~/utils/api";

export const useSupplierStore = defineStore("suppliers", () => {
  const suppliers = ref<Supplier[]>([]);
  const supplier = ref<Supplier | null>(null);
  const totalSuppliers = ref(0);
  const isLoading = ref(false);

  const query = ref<FetchSupplierParams>({
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

  const syncSupplierRecord = (nextSupplier: Supplier) => {
    supplier.value = nextSupplier;
    suppliers.value = suppliers.value.map((entry) =>
      entry.id === nextSupplier.id ? nextSupplier : entry,
    );
  };

  async function fetchSuppliers(params?: FetchSupplierParams) {
    isLoading.value = true;

    try {
      if (params) {
        query.value = {
          ...query.value,
          ...params,
        };
      }

      const result = await apiRequest<Supplier[]>("/suppliers", {
        query: query.value,
      });

      suppliers.value = result.data || [];
      totalSuppliers.value =
        result.total || result.meta?.total || result.data?.length || 0;

      pagination.value = {
        page: result.meta?.page || 1,
        limit: result.meta?.limit || query.value.limit || 10,
        total: result.meta?.total || result.total || result.data?.length || 0,
        totalPages: result.meta?.totalPages || 0,
      };

      return {
        status: "success",
        message: result.message || "Suppliers fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching suppliers:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to fetch suppliers",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchSupplierById(id: string) {
    isLoading.value = true;

    try {
      const result = await apiRequest<Supplier>(`/suppliers/${id}`);
      supplier.value = result.data;

      return {
        status: "success",
        message: result.message || "Supplier fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching supplier:", error);
      supplier.value = null;

      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to fetch supplier",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function addSupplier(
    payload: CreateSupplierPayload,
  ): Promise<StoreResponse<Supplier>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Supplier>("/suppliers", {
        method: "POST",
        body: payload,
      });

      if (result.data) {
        suppliers.value = [
          result.data,
          ...suppliers.value.filter((entry) => entry.id !== result.data?.id),
        ];
        totalSuppliers.value += 1;
      }

      return {
        status: "success",
        message: result.message || "Supplier created successfully",
        statusMessage: result.statusMessage || "created",
        data: result.data || null,
      };
    } catch (error) {
      console.error("Error adding supplier:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to add supplier",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateSupplier(
    id: string,
    payload: UpdateSupplierPayload,
  ): Promise<StoreResponse<Supplier>> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Supplier>(`/suppliers/${id}`, {
        method: "PATCH",
        body: payload,
      });

      if (result.data) {
        syncSupplierRecord(result.data);
      }

      return {
        status: "success",
        message: result.message || "Supplier updated successfully",
        statusMessage: result.statusMessage || "accepted",
        data: result.data || null,
      };
    } catch (error) {
      console.error("Error updating supplier:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to update supplier",
        statusMessage: "internal server error",
        data: null,
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteSupplier(id: string): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const { data: result, ok } = await apiRequestRaw<null>(`/suppliers/${id}`, {
        method: "DELETE",
      });

      if (!ok || (result && result.status === "error")) {
        throw new Error(result?.message || "Failed to delete supplier");
      }

      suppliers.value = suppliers.value.filter((entry) => entry.id !== id);
      totalSuppliers.value = Math.max(0, totalSuppliers.value - 1);

      if (supplier.value?.id === id) {
        supplier.value = null;
      }

      return {
        status: "success",
        message: result?.message || "Supplier deleted successfully",
        statusMessage: result?.statusMessage || "no content",
      };
    } catch (error) {
      console.error("Error deleting supplier:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to delete supplier",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    suppliers,
    supplier,
    totalSuppliers,
    isLoading,
    query,
    pagination,
    fetchSuppliers,
    fetchSupplierById,
    addSupplier,
    updateSupplier,
    deleteSupplier,
  };
});
