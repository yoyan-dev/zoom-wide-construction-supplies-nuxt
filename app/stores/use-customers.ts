import { ref } from "vue";
import { defineStore } from "pinia";
import type { Customer, FetchCustomerParams } from "~/types/customer";
import type { PaginationMeta } from "~/types/pagination";
import type { StoreResponse } from "~/types/store-response";
import { apiRequest, apiRequestRaw } from "~/utils/api";

export const useCustomerStore = defineStore("customers", () => {
  const customers = ref<Customer[]>([]);
  const customer = ref<Customer | null>(null);
  const totalCustomers = ref(0);
  const isLoading = ref(false);

  const query = ref<FetchCustomerParams>({
    q: "",
    page: 1,
  });

  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  async function fetchCustomers(params?: FetchCustomerParams) {
    isLoading.value = true;

    try {
      if (params) {
        query.value = {
          ...query.value,
          ...params,
        };
      }

      const result = await apiRequest<Customer[]>("/customers", {
        query: query.value,
      });

      customers.value = result.data || [];
      totalCustomers.value = result.total || result.meta?.total || 0;

      pagination.value = {
        page: result.meta?.page || 1,
        limit: result.meta?.limit || 10,
        total: result.meta?.total || result.total || 0,
        totalPages: result.meta?.totalPages || 0,
      };

      return {
        status: "success",
        message: result.message || "Customers fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching customers:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to fetch customers",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchCustomerById(id: string) {
    isLoading.value = true;

    try {
      const result = await apiRequest<Customer>(`/customers/${id}`);

      customer.value = result.data;

      return {
        status: "success",
        message: result.message || "Customer fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching customer:", error);
      customer.value = null;

      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to fetch customer",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function addCustomer(
    payload: Omit<Customer, "id" | "created_at" | "updated_at">,
  ): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Customer>("/customers", {
        method: "POST",
        body: payload,
      });

      await fetchCustomers();

      return {
        status: "success",
        message: result.message || "Customer created successfully",
        statusMessage: result.statusMessage || "created",
      };
    } catch (error) {
      console.error("Error adding customer:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to add customer",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function updateCustomer(
    id: string,
    payload: Partial<Omit<Customer, "id" | "created_at" | "updated_at">>,
  ): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const result = await apiRequest<Customer>(`/customers/${id}`, {
        method: "PATCH",
        body: payload,
      });

      customer.value = result.data || customer.value;
      await fetchCustomers();

      return {
        status: "success",
        message: result.message || "Customer updated successfully",
        statusMessage: result.statusMessage || "accepted",
      };
    } catch (error) {
      console.error("Error updating customer:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to update customer",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  async function deleteCustomer(id: string): Promise<StoreResponse> {
    isLoading.value = true;

    try {
      const { data: result, ok } = await apiRequestRaw<null>(`/customers/${id}`, {
        method: "DELETE",
      });

      if (!ok || (result && result.status === "error")) {
        throw new Error(result?.message || "Failed to delete customer");
      }

      customers.value = customers.value.filter((item) => item.id !== id);
      totalCustomers.value = Math.max(0, totalCustomers.value - 1);

      return {
        status: "success",
        message: result?.message || "Customer deleted successfully",
        statusMessage: result?.statusMessage || "no content",
      };
    } catch (error) {
      console.error("Error deleting customer:", error);
      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to delete customer",
        statusMessage: "internal server error",
      };
    } finally {
      isLoading.value = false;
    }
  }

  return {
    customers,
    customer,
    totalCustomers,
    isLoading,
    query,
    pagination,
    fetchCustomers,
    fetchCustomerById,
    addCustomer,
    updateCustomer,
    deleteCustomer,
  };
});
