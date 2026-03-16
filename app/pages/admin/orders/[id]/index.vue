<script setup lang="ts">
import { storeToRefs } from "pinia";
import { formatCurrency, formatLongDate } from "~/utils/format";

definePageMeta({
  layout: "admin",
});

const route = useRoute();
const router = useRouter();
const orderId = computed(() => String(route.params.id));

const orderStore = useOrderStore();
const customerStore = useCustomerStore();
const deliveryStore = useDeliveryStore();
const paymentStore = usePaymentStore();

await Promise.all([
  orderStore.fetchOrderById(orderId.value),
  customerStore.fetchCustomers(),
  deliveryStore.fetchDeliveries(),
  paymentStore.fetchPayments(),
]);

const { order, orderItems, orderActivity } = storeToRefs(orderStore);
const { customers } = storeToRefs(customerStore);
const { deliveries } = storeToRefs(deliveryStore);
const { payments } = storeToRefs(paymentStore);

const customer = computed(() =>
  customers.value.find((item) => item.id === order.value?.customer_id),
);
const items = computed(() =>
  orderItems.value.filter((item) => item.order_id === orderId.value),
);
const delivery = computed(() =>
  deliveries.value.find((item) => item.order_id === orderId.value),
);
const payment = computed(() =>
  payments.value.find((item) => item.order_id === orderId.value),
);
const activity = computed(() => orderActivity.value[orderId.value] ?? []);

const goBack = () => router.push("/admin/orders");
const editOrder = () => router.push(`/admin/orders/edit/${orderId.value}`);
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
              Orders Management
            </p>
            <h1 class="mt-2 text-2xl font-semibold">
              Order {{ order?.id ?? "Not found" }}
            </h1>
            <p class="mt-2 text-sm text-slate-600">
              Track fulfillment, payment, and delivery progress.
            </p>
          </div>
          <div class="flex flex-wrap items-center gap-2">
            <UButton color="neutral" variant="outline" @click="goBack">
              Back to Orders
            </UButton>
            <UButton color="primary" @click="editOrder">Edit Order</UButton>
          </div>
        </div>
      </section>

      <div v-if="order">
        <UCard id="overview">
          <div class="grid gap-4 md:grid-cols-3">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Status
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ order.status }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Customer
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ customer?.company_name ?? order.customer_id }}
              </p>
              <p class="text-sm text-slate-500">
                {{ customer?.contact_name ?? "No contact" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Total
              </p>
              <p class="mt-2 text-lg font-semibold text-slate-800">
                {{ formatCurrency(order.total_amount) }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard id="details">
          <div class="grid gap-4 md:grid-cols-2">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Notes
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ order.notes ?? "No notes recorded." }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Approval
              </p>
              <p class="mt-2 text-sm text-slate-600">
                Approved by {{ order.approved_by ?? "Pending approval" }}
              </p>
              <p class="text-sm text-slate-600">
                Rejection reason: {{ order.rejection_reason ?? "N/A" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Created
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ formatLongDate(order.created_at) }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Updated
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ formatLongDate(order.updated_at) }}
              </p>
            </div>
          </div>
        </UCard>

        <UCard id="items">
          <div class="mb-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Ordered Items
            </p>
            <p class="mt-1 text-lg font-semibold">Line items</p>
          </div>
          <div class="space-y-3">
            <div
              v-for="item in items"
              :key="item.id"
              class="flex items-center justify-between rounded-lg border border-slate-200/70 p-3"
            >
              <div>
                <p class="text-sm font-medium text-slate-800">
                  {{ item.product_id }}
                </p>
                <p class="text-xs text-slate-500">Item ID {{ item.id }}</p>
              </div>
              <div class="text-sm text-slate-600">
                {{ item.quantity }} x {{ item.unit_price }}
              </div>
              <div class="text-sm font-semibold text-slate-800">
                {{ formatCurrency(item.line_total) }}
              </div>
            </div>
            <p v-if="!items.length" class="text-sm text-slate-500">
              No items recorded for this order.
            </p>
          </div>
        </UCard>

        <UCard id="payment">
          <div class="mb-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Payment
            </p>
            <p class="mt-1 text-lg font-semibold">Payment status</p>
          </div>
          <div v-if="payment" class="grid gap-3 md:grid-cols-2">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Status
              </p>
              <p class="mt-2 text-sm text-slate-600">{{ payment.status }}</p>
            </div>
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
          </div>
          <p v-else class="text-sm text-slate-500">
            No payment record linked to this order.
          </p>
        </UCard>

        <UCard id="delivery">
          <div class="mb-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Delivery
            </p>
            <p class="mt-1 text-lg font-semibold">Delivery status</p>
          </div>
          <div v-if="delivery" class="grid gap-3 md:grid-cols-2">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Status
              </p>
              <p class="mt-2 text-sm text-slate-600">{{ delivery.status }}</p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Driver
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ delivery.driver_id ?? "Unassigned" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Vehicle
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{ delivery.vehicle_number ?? "TBD" }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Scheduled at
              </p>
              <p class="mt-2 text-sm text-slate-600">
                {{
                  delivery.scheduled_at
                    ? formatLongDate(delivery.scheduled_at)
                    : "TBD"
                }}
              </p>
            </div>
          </div>
          <p v-else class="text-sm text-slate-500">
            No delivery record linked to this order.
          </p>
        </UCard>

        <UCard id="timeline">
          <div class="mb-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Timeline
            </p>
            <p class="mt-1 text-lg font-semibold">Order activity</p>
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
            No timeline updates yet.
          </p>
        </UCard>

        <UCard id="audit">
          <div class="mb-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Audit Logs
            </p>
            <p class="mt-1 text-lg font-semibold">Audit history</p>
          </div>
          <div v-if="activity.length" class="space-y-3">
            <div
              v-for="entry in activity"
              :key="`audit-${entry.at}-${entry.action}`"
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
            No audit entries recorded.
          </p>
        </UCard>
      </div>

      <UCard v-else>
        <p class="text-sm text-slate-600">
          Order not found. Check the URL or return to the orders list.
        </p>
      </UCard>
    </div>
  </div>
</template>
