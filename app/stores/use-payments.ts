import { defineStore } from "pinia";
import { ref } from "vue";
import type {
  FetchPaymentParams,
  Payment,
  PaymentPagination,
} from "~/types/payment";
import type { H3Response } from "~/types/h3Response";
// TODO: Keep local seed-backed behavior until Nitro payment routes are implemented.
import { payments as seedPayments } from "~/seeds/payments";
import { downloadText, printText } from "~/utils/documents";
import { toErrorMessage } from "~/utils/api";

type PaymentActivity = {
  action: string;
  at: string;
  detail?: string;
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
  message: toErrorMessage(err),
});

export const usePaymentStore = defineStore("payments", () => {
  const error = ref<string | null>(null);
  const payment = ref<Payment | null>(null);
  const isLoading = ref(false);

  const allPayments = ref<Payment[]>([...seedPayments]);
  const payments = ref<Payment[]>([]);
  const paymentActivity = ref<Record<string, PaymentActivity[]>>({});

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
      error.value = toErrorMessage(err);
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
      error.value = toErrorMessage(err);
      return buildErrorResponse<Payment | null>(err);
    }
  };

  const logPaymentActivity = (
    paymentId: string,
    action: string,
    detail?: string,
  ) => {
    const entry: PaymentActivity = {
      action,
      detail,
      at: new Date().toISOString(),
    };
    const current = paymentActivity.value[paymentId] ?? [];
    paymentActivity.value = {
      ...paymentActivity.value,
      [paymentId]: [entry, ...current],
    };
  };

  const createPayment = async (
    payload: Omit<Payment, "id" | "created_at" | "updated_at">,
  ): Promise<H3Response<Payment>> => {
    try {
      isLoading.value = true;
      const now = new Date().toISOString();
      const created: Payment = {
        id: `pay-${Date.now()}`,
        order_id: payload.order_id,
        amount: payload.amount,
        method: payload.method,
        status: payload.status,
        transaction_ref: payload.transaction_ref ?? null,
        paid_at: payload.paid_at ?? null,
        created_at: now,
        updated_at: now,
      };

      allPayments.value = [created, ...allPayments.value];
      logPaymentActivity(created.id, "Payment recorded");
      await fetchPayments();

      return buildOkResponse(created, 1);
    } catch (err: any) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Payment>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const updatePayment = async (
    id: string,
    payload: Partial<Payment>,
    log?: { action: string; detail?: string },
  ): Promise<H3Response<Payment | null>> => {
    try {
      isLoading.value = true;
      const index = allPayments.value.findIndex((item) => item.id === id);
      if (index === -1) {
        return buildOkResponse(null, 0);
      }

      const current = allPayments.value[index];
      if (!current) {
        return buildOkResponse(null, 0);
      }

      const updated: Payment = {
        ...current,
        ...payload,
        id,
        updated_at: new Date().toISOString(),
      };

      allPayments.value.splice(index, 1, updated);

      if (payment.value?.id === id) {
        payment.value = updated;
      }

      if (log) {
        logPaymentActivity(id, log.action, log.detail);
      }

      await fetchPayments();

      return buildOkResponse(updated, 1);
    } catch (err: any) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<Payment | null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const deletePayment = async (id: string): Promise<H3Response<null>> => {
    try {
      isLoading.value = true;
      allPayments.value = allPayments.value.filter((item) => item.id !== id);

      if (payment.value?.id === id) {
        payment.value = null;
      }

      logPaymentActivity(id, "Payment deleted");
      await fetchPayments();

      return buildOkResponse(null, 1);
    } catch (err: any) {
      error.value = toErrorMessage(err);
      return buildErrorResponse<null>(err);
    } finally {
      isLoading.value = false;
    }
  };

  const getPaymentByOrderId = (orderId: string) =>
    allPayments.value.find((item) => item.order_id === orderId) ?? null;

  const markPaid = async (id: string) => {
    await updatePayment(
      id,
      { status: "paid", paid_at: new Date().toISOString() },
      { action: "Payment marked as paid" },
    );
  };

  const verifyPayment = async (id: string) => {
    await updatePayment(
      id,
      { status: "paid", paid_at: new Date().toISOString() },
      { action: "Payment verified" },
    );
  };

  const rejectPayment = async (id: string, reason?: string) => {
    await updatePayment(
      id,
      { status: "failed", paid_at: null },
      { action: "Payment rejected", detail: reason },
    );
  };

  const adjustPaymentAmount = async (id: string, amount: number) => {
    await updatePayment(
      id,
      { amount },
      { action: "Payment amount adjusted", detail: `Amount ${amount}` },
    );
  };

  const refundPayment = async (id: string) => {
    await updatePayment(
      id,
      { status: "refunded" },
      { action: "Payment refunded" },
    );
  };

  const partialRefund = async (id: string, amount: number) => {
    await updatePayment(
      id,
      { amount, status: "refunded" },
      { action: "Partial refund", detail: `Refunded to ${amount}` },
    );
  };

  const recordManualPayment = async (
    id: string,
    payload: { method: Payment["method"]; transaction_ref?: string },
  ) => {
    await updatePayment(
      id,
      {
        method: payload.method,
        transaction_ref: payload.transaction_ref ?? null,
        status: "paid",
        paid_at: new Date().toISOString(),
      },
      { action: "Manual payment recorded" },
    );
  };

  const markPaidForOrder = async (orderId: string, amount: number) => {
    const existing = getPaymentByOrderId(orderId);
    if (existing) {
      await markPaid(existing.id);
      return;
    }

    await createPayment({
      order_id: orderId,
      amount,
      method: "bank_transfer",
      status: "paid",
      transaction_ref: `TXN-${Date.now()}`,
      paid_at: new Date().toISOString(),
    });
  };

  const buildReceipt = (id: string) => {
    const current = allPayments.value.find((item) => item.id === id);
    if (!current) return "";
    return [
      `Payment ${current.id}`,
      `Order ${current.order_id}`,
      `Amount ${current.amount}`,
      `Method ${current.method}`,
      `Status ${current.status}`,
      `Reference ${current.transaction_ref ?? "N/A"}`,
    ].join("\n");
  };

  const generateReceipt = (id: string) => {
    const content = buildReceipt(id);
    if (!content) return;
    logPaymentActivity(id, "Receipt generated");
  };

  const printReceipt = (id: string) => {
    const content = buildReceipt(id);
    if (!content) return;
    printText(`Payment ${id} receipt`, content);
    logPaymentActivity(id, "Receipt printed");
  };

  const downloadReceipt = (id: string) => {
    const content = buildReceipt(id);
    if (!content) return;
    downloadText(`payment-${id}-receipt.txt`, content, "text/plain");
    logPaymentActivity(id, "Receipt downloaded");
  };

  const sendReceiptEmail = (id: string) => {
    logPaymentActivity(id, "Receipt emailed");
  };

  const sendPaymentConfirmation = (id: string) => {
    logPaymentActivity(id, "Payment confirmation sent");
  };

  const exportPayment = (id: string) => {
    const current = allPayments.value.find((item) => item.id === id);
    if (!current) return;
    const payload = JSON.stringify(current, null, 2);
    downloadText(`payment-${id}.json`, payload, "application/json");
    logPaymentActivity(id, "Payment exported");
  };

  const getPaymentActivity = (id: string) => paymentActivity.value[id] ?? [];

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
    paymentActivity,
    query,
    pagination,
    isLoading,
    error,
    fetchPayments,
    fetchPaymentById,
    createPayment,
    updatePayment,
    deletePayment,
    getPaymentByOrderId,
    logPaymentActivity,
    markPaid,
    verifyPayment,
    rejectPayment,
    adjustPaymentAmount,
    refundPayment,
    partialRefund,
    recordManualPayment,
    markPaidForOrder,
    generateReceipt,
    printReceipt,
    downloadReceipt,
    sendReceiptEmail,
    sendPaymentConfirmation,
    exportPayment,
    getPaymentActivity,
    setSearch,
    setFilter,
    setPage,
  };
});
