<script setup lang="ts">
import { storeToRefs } from "pinia";
import { formatCurrency, formatLongDate } from "~/utils/format";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const paymentId = computed(() => String(route.params.id));

const paymentStore = usePaymentStore();
const orderStore = useOrderStore();

await Promise.all([
  paymentStore.fetchPaymentById(paymentId.value),
  orderStore.fetchOrders(),
]);

const { payment, paymentActivity } = storeToRefs(paymentStore);
const { orders } = storeToRefs(orderStore);

const order = computed(() =>
  orders.value.find((item) => item.id === payment.value?.order_id),
);
const activity = computed(() => paymentActivity.value[paymentId.value] ?? []);

const goBack = () => router.push("/admin/payments");
</script>

<template>
  <div class="min-h-screen">
    <div class="space-y-6">
      <section class="bg-white p-2">
        <div
          class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between"
        >
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Payments Management
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              Payment {{ payment?.id ?? "Not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Review proof, receipts, and settlement activity.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Payments
            </UButton>
          </div>
        </div>
      </section>

      <div v-if="payment">
        <UCard id="overview">
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Status
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ payment.status }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Order
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ payment.order_id }}
              </p>
              <p class="text-sm text-slate-500">
                {{ order?.customer_id ?? "Customer unknown" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Amount
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ formatCurrency(payment.amount) }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard id="details">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Method
              </p>
              <p class="mt-2 text-sm text-slate-600">{{ payment.method }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Reference
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ payment.transaction_ref ?? "No reference" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Paid at
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ payment.paid_at ? formatLongDate(payment.paid_at) : "Pending" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Updated
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ formatLongDate(payment.updated_at) }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard id="proof">
          <div class="mb-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Payment Proof
            </p>
            <p class="mt-1 text-lg font-semibold">Proof details</p>
          </div>
          <p class="text-sm text-slate-600">
            Reference: {{ payment.transaction_ref ?? "No proof uploaded." }}
          </p>
        </UCard>

        <UCard id="receipt">
          <div class="mb-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Receipt
            </p>
            <p class="mt-1 text-lg font-semibold">Receipt status</p>
          </div>
          <p class="text-sm text-slate-600">
            Generate, print, or download receipts from the actions menu.
          </p>
        </UCard>

        <UCard id="logs">
          <div class="mb-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Payment Logs
            </p>
            <p class="mt-1 text-lg font-semibold">Activity history</p>
          </div>
          <div v-if="activity.length" class="space-y-3">
            <div
              v-for="entry in activity"
              :key="entry.at + entry.action"
              class="rounded-lg border border-slate-200/70 p-3"
            >
              <p class="text-sm font-medium text-slate-800">
                {{ entry.action }}
              </p>
              <p class="text-xs text-slate-500">
                {{ formatLongDate(entry.at) }}
              </p>
              <p v-if="entry.detail" class="text-xs text-slate-500">
                {{ entry.detail }}
              </p>
            </div>
          </div>
          <p v-else class="text-sm text-slate-500">
            No payment logs recorded.
          </p>
        </UCard>
      </div>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Payment not found. Check the URL or return to the payments list.
        </p>
      </UCard>
    </div>
  </div>
</template>
