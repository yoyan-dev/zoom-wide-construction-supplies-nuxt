import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  FetchPaymentParams,
  Payment,
  PaymentPagination,
} from "~/types/payment";
import type { H3Response } from "~/types/h3Response";
import { payments as seedPayments } from "~/seeds/payments";

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

export const usePaymentStore = defineStore("payments", () => {
  const error = ref<Error | null>(null);
  const payment = ref<Payment | null>(null);
  const isLoading = ref(false);

  const allPayments = ref<Payment[]>([...seedPayments]);
  const payments = ref<Payment[]>([]);

  const query = ref<FetchPaymentParams>({
    q: "",
    status: "",
    method: "",
    order_id: "",
    page: 1,
  });

  const pagination = ref<PaymentPagination>({
    page: 1,
    limit: seedPayments.length,
    total: 0,
    total_pages: 0,
  });

  const fetchPayments = async (): Promise<H3Response<Payment[]>> => {
    try {
      isLoading.value = true;

      let filtered = [...allPayments.value];

      if (query.value.q) {
        const q = query.value.q.toLowerCase();
        filtered = filtered.filter((p) => {
          const txn = p.transaction_ref ?? "";
          return (
            p.id.toLowerCase().includes(q) ||
            p.order_id.toLowerCase().includes(q) ||
            txn.toLowerCase().includes(q)
          );
        });
      }

      if (query.value.status) {
        filtered = filtered.filter((p) => p.status === query.value.status);
      }

      if (query.value.method) {
        filtered = filtered.filter((p) => p.method === query.value.method);
      }

      if (query.value.order_id) {
        filtered = filtered.filter((p) => p.order_id === query.value.order_id);
      }

      const start = (query.value.page! - 1) * pagination.value.limit!;
      const end = start + pagination.value.limit!;

      pagination.value.total = filtered.length;
      pagination.value.total_pages = Math.ceil(
        filtered.length / pagination.value.limit!,
      );
      pagination.value.page = query.value.page;

      payments.value = filtered.slice(start, end);
      return buildOkResponse(payments.value, pagination.value.total);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Payment[]>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const fetchPaymentById = async (
    id: string,
  ): Promise<H3Response<Payment | null>> => {
    try {
      const found = allPayments.value.find((p) => p.id === id);

      if (!found) {
        payment.value = null;
        return buildOkResponse(null, 0);
      }

      payment.value = found;
      return buildOkResponse(payment.value, 1);
    } catch (err: any) {
      error.value = err;
      return buildErrorResponse<Payment | null>(err);
    }
  };

  const setSearch = async (value: string) => {
    query.value.q = value;
    query.value.page = 1;
    return await fetchPayments();
  };

  const setFilter = async (filters: Partial<FetchPaymentParams>) => {
    query.value = {
      ...query.value,
      ...filters,
      page: 1,
    };

    return await fetchPayments();
  };

  const setPage = async (page: number) => {
    query.value.page = page;
    return await fetchPayments();
  };

  return {
    payment,
    payments,
    query,
    pagination,
    isLoading,
    error,
    fetchPayments,
    fetchPaymentById,
    setSearch,
    setFilter,
    setPage,
  };
});
