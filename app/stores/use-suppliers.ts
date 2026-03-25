import { ref } from "vue";
import { defineStore } from "pinia";
import type { H3Response } from "~/types/h3Response";
import type { PaginationMeta } from "~/types/pagination";
import type { StoreResponse } from "~/types/store-response";
import type { FetchSupplierParams, Supplier } from "~/types/supplier";

const BASE_URL = import.meta.env.VITE_API_URL;

export const useSupplierStore = defineStore("suppliers", () => {
  const suppliers = ref<Supplier[]>([]);
  const supplier = ref<Supplier | null>(null);
  const totalSuppliers = ref(0);
  const isLoading = ref(false);

  const query = ref<FetchSupplierParams>({
    q: "",
    page: 1,
  });

  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  function buildQueryString(params?: FetchSupplierParams) {
    const searchParams = new URLSearchParams();

    if (!params) return searchParams.toString();

    Object.entries(params).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== "") {
        searchParams.append(key, String(value));
      }
    });

    return searchParams.toString();
  }

  async function fetchSuppliers(params?: FetchSupplierParams) {
    isLoading.value = true;

    try {
      if (params) {
        query.value = {
          ...query.value,
          ...params,
        };
      }

      const queryString = buildQueryString(query.value);
      const response = await fetch(`${BASE_URL}/suppliers?${queryString}`);
      const result: H3Response<Supplier[]> = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(result.message || "Failed to fetch suppliers");
      }

      suppliers.value = result.data || [];
      totalSuppliers.value = result.total || result.meta?.total || 0;

      pagination.value = {
        page: result.meta?.page || 1,
        limit: result.meta?.limit || 10,
        total: result.meta?.total || result.total || 0,
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
      const response = await fetch(`${BASE_URL}/suppliers/${id}`);
      const result: H3Response<Supplier> = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(result.message || "Failed to fetch supplier");
      }

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

  async function addSupplier(payload: FormData): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const response = await fetch(`${BASE_URL}/suppliers`, {
        method: "POST",
        body: payload,
      });

      const result: H3Response<Supplier> = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(result.message || "Failed to add supplier");
      }

      await fetchSuppliers();

      return {
        status: "success",
        message: result.message || "Supplier created successfully",
        statusMessage: result.statusMessage || "created",
      };
    } catch (error) {
      console.error("Error adding supplier:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to add supplier",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateSupplier(
    id: string,
    payload: Supplier,
  ): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const response = await fetch(`${BASE_URL}/suppliers/${id}`, {
        method: "PATCH",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      const result: H3Response<Supplier> = await response.json();

      if (!response.ok || result.status === "error") {
        throw new Error(result.message || "Failed to update supplier");
      }

      supplier.value = result.data || supplier.value;
      await fetchSuppliers();

      return {
        status: "success",
        message: result.message || "Supplier updated successfully",
        statusMessage: result.statusMessage || "accepted",
      };
    } catch (error) {
      console.error("Error updating category:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to update supplier",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteSupplier(id: string): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const response = await fetch(`${BASE_URL}/suppliers/${id}`, {
        method: "DELETE",
      });

      let result: H3Response<null> | null = null;

      if (response.status !== 204) {
        result = await response.json();
      }

      if (!response.ok || (result && result.status === "error")) {
        throw new Error(result?.message || "Failed to delete supplier");
      }

      suppliers.value = suppliers.value.filter((item) => item.id !== id);
      totalSuppliers.value = Math.max(0, totalSuppliers.value - 1);

      return {
        status: "success",
        message: result?.message || "Supplier deleted successfully",
        statusMessage: result?.statusMessage || "no content",
      };
    } catch (error) {
      console.error("Error deleting category:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to delete category",
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
