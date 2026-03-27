import { ref } from "vue";
import { defineStore } from "pinia";
import type { PaginationMeta } from "~/types/pagination";
import type { StoreResponse } from "~/types/store-response";
import type { FetchPaymentParams, Payment } from "~/types/payment";
import { apiRequest } from "~/utils/api";

export const usePaymentStore = defineStore("payments", () => {
  const payments = ref<Payment[]>([]);
  const payment = ref<Payment | null>(null);
  const totalPayments = ref(0);
  const isLoading = ref(false);

  const query = ref<FetchPaymentParams>({
    q: "",
    page: 1,
  });

  const pagination = ref<PaginationMeta>({
    page: 1,
    limit: 10,
    total: 0,
    totalPages: 0,
  });

  async function fetchPayments(params?: FetchPaymentParams) {
    isLoading.value = true;

    try {
      if (params) {
        query.value = {
          ...query.value,
          ...params,
        };
      }

      const result = await apiRequest<Payment[]>("/payments", {
        query: query.value,
      });

      payments.value = result.data || [];
      totalPayments.value =
        result.total || result.meta?.total || result.data?.length || 0;

      pagination.value = {
        page: result.meta?.page || 1,
        limit: result.meta?.limit || 10,
        total: result.meta?.total || result.total || result.data?.length || 0,
        totalPages: result.meta?.totalPages || 0,
      };

      return {
        status: "success",
        message: result.message || "Payments fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching payments:", error);

      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to fetch payments",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  async function fetchPaymentById(id: string) {
    isLoading.value = true;

    try {
      const result = await apiRequest<Payment>(`/payments/${id}`);

      payment.value = result.data;

      return {
        status: "success",
        message: result.message || "Payment fetched successfully",
        statusMessage: result.statusMessage,
      } as StoreResponse;
    } catch (error) {
      console.error("Error fetching payment:", error);
      payment.value = null;

      return {
        status: "error",
        message:
          error instanceof Error ? error.message : "Failed to fetch payment",
        statusMessage: "internal server error",
      } as StoreResponse;
    } finally {
      isLoading.value = false;
    }
  }

  return {
    payments,
    payment,
    totalPayments,
    isLoading,
    query,
    pagination,
    fetchPayments,
    fetchPaymentById,
  };
});
