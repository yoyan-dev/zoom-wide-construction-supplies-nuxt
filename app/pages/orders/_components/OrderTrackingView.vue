<script setup lang="ts">
import { storeToRefs } from "pinia";
import type { Delivery } from "~/types/delivery";
import OrderDeliveryVisibilityCard from "./OrderDeliveryVisibilityCard.vue";
import OrderStatusTimeline from "./shared/OrderStatusTimeline.vue";
import MyOrdersStateCard from "./MyOrdersStateCard.vue";
import { formatCurrency, formatLongDate } from "~/utils/format";

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const route = useRoute();
const router = useRouter();
const orderId = computed(() => String(route.params.id));
const orderStore = useOrderStore();
const deliveryStore = useDeliveryStore();
const pageError = ref<string | null>(null);
const deliveryError = ref<string | null>(null);
const isRetrying = ref(false);
const isMissingOrder = ref(false);
const isLoadingDelivery = ref(false);
const resolvedDelivery = ref<Delivery | null>(null);

const statusBadge = (status: string): { color: BadgeColor; label: string } => {
  switch (status) {
    case "approved":
      return { color: "success", label: "Approved" };
    case "rejected":
      return { color: "error", label: "Rejected" };
    case "cancelled":
      return { color: "neutral", label: "Cancelled" };
    case "completed":
      return { color: "info", label: "Completed" };
    default:
      return { color: "warning", label: "Pending" };
  }
};

const loadPage = async () => {
  const orderResponse = await orderStore.fetchOrderById(orderId.value);

  isMissingOrder.value =
    orderResponse.status === "error" &&
    /not found/i.test(
      `${orderResponse.message ?? ""} ${orderResponse.statusMessage ?? ""}`.trim(),
    );

  pageError.value =
    orderResponse.status === "error" && !isMissingOrder.value
      ? orderResponse.message || "Your order could not be loaded right now."
      : null;

  resolvedDelivery.value = null;
  deliveryError.value = null;
  isLoadingDelivery.value = false;

  if (orderResponse.status === "success" && orderStore.order?.id) {
    isLoadingDelivery.value = true;

    const deliveryResponse = await deliveryStore.fetchDeliveries({
      q: "",
      status: "",
      order_id: orderStore.order.id,
      page: 1,
    });

    if (deliveryResponse.status === "error") {
      deliveryError.value =
        deliveryResponse.message || "Delivery updates are unavailable right now.";
    } else {
      resolvedDelivery.value =
        [...deliveryStore.deliveries]
          .filter((entry) => entry.order_id === orderStore.order?.id)
          .sort(
            (left, right) =>
              new Date(right.updated_at).getTime() -
              new Date(left.updated_at).getTime(),
          )[0] ?? null;
    }

    isLoadingDelivery.value = false;
  }
};

await loadPage();

watch(
  () => orderId.value,
  async () => {
    await loadPage();
  },
);

const { order, orderItems, isLoading } = storeToRefs(orderStore);

const lineItems = computed(() =>
  order.value?.id
    ? orderItems.value.filter((item) => item.order_id === order.value?.id)
    : [],
);

const totalUnits = computed(() =>
  lineItems.value.reduce((sum, item) => sum + item.quantity, 0),
);

const goBack = () => {
  void router.push("/orders");
};

const retryLoad = async () => {
  isRetrying.value = true;
  await loadPage();
  isRetrying.value = false;
};
</script>

<template>
  <div class="mx-auto flex w-full max-w-7xl flex-col gap-6 px-4 py-6 sm:px-6 lg:px-8">
    <section class="rounded-[32px] border border-slate-200/70 bg-white p-6 shadow-sm md:p-8">
      <div class="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <p class="text-xs uppercase tracking-[0.22em] text-amber-600">
            Order Tracking
          </p>
          <h1 class="mt-3 text-3xl font-semibold tracking-tight text-slate-900">
            {{ order?.id ? `Order ${order.id}` : "Order not found" }}
          </h1>
          <p class="mt-3 text-sm leading-7 text-slate-600">
            Review the latest status, item summary, and order progress in one place.
          </p>
        </div>

        <div class="flex flex-wrap items-center gap-3">
          <UButton color="neutral" variant="outline" @click="goBack">
            Back to My Orders
          </UButton>
        </div>
      </div>
    </section>

    <MyOrdersStateCard
      v-if="pageError"
      eyebrow="Order Tracking"
      title="Order unavailable"
      :description="pageError"
      tone="error"
      action-label="Retry"
      :action-loading="isRetrying"
      @action="retryLoad"
    />

    <MyOrdersStateCard
      v-else-if="isMissingOrder || (!isLoading && !order)"
      eyebrow="Order Tracking"
      title="Order not found"
      description="Check the order reference or return to your orders list."
      action-label="Back to My Orders"
      @action="goBack"
    />

    <div v-else-if="isLoading" class="space-y-6">
      <UCard>
        <div class="space-y-4">
          <USkeleton class="h-6 w-48" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-36" />
        </div>
      </UCard>
      <UCard>
        <div class="space-y-4">
          <USkeleton class="h-5 w-40" />
          <USkeleton class="h-4 w-full" />
          <USkeleton class="h-4 w-full" />
        </div>
      </UCard>
    </div>

    <div v-else-if="order" class="grid gap-6 xl:grid-cols-[minmax(0,1.1fr)_minmax(320px,0.9fr)] xl:items-start">
      <div class="space-y-6">
        <UCard>
          <div class="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Order Summary
              </p>
              <p class="mt-2 text-xl font-semibold text-slate-900">
                {{ formatCurrency(order.total_amount ?? 0) }}
              </p>
            </div>

            <UBadge :color="statusBadge(order.status).color" variant="subtle">
              {{ statusBadge(order.status).label }}
            </UBadge>
          </div>

          <div class="mt-6 grid gap-4 md:grid-cols-3">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Submitted
              </p>
              <p class="mt-2 font-medium text-slate-900">
                {{ formatLongDate(order.created_at) }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Last Updated
              </p>
              <p class="mt-2 font-medium text-slate-900">
                {{ formatLongDate(order.updated_at) }}
              </p>
            </div>
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Total Units
              </p>
              <p class="mt-2 font-medium text-slate-900">
                {{ totalUnits }}
              </p>
            </div>
          </div>

          <div v-if="order.notes" class="mt-6 rounded-2xl bg-slate-50 p-4">
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Order Notes
            </p>
            <p class="mt-2 whitespace-pre-line text-sm leading-6 text-slate-700">
              {{ order.notes }}
            </p>
          </div>
        </UCard>

        <UCard>
          <div class="flex items-center justify-between gap-4">
            <div>
              <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
                Item Summary
              </p>
              <h2 class="mt-2 text-xl font-semibold text-slate-900">
                Order Items
              </h2>
            </div>
          </div>

          <div
            v-if="lineItems.length"
            class="mt-6 space-y-3"
          >
            <div
              v-for="item in lineItems"
              :key="item.id"
              class="flex items-start justify-between gap-4 rounded-2xl border border-slate-200/70 p-4"
            >
              <div>
                <p class="font-medium text-slate-900">
                  Product {{ item.product_id }}
                </p>
                <p class="mt-1 text-sm text-slate-600">
                  {{ item.quantity }} x {{ formatCurrency(item.unit_price) }}
                </p>
              </div>

              <p class="font-semibold text-slate-900">
                {{ formatCurrency(item.line_total) }}
              </p>
            </div>
          </div>

          <div
            v-else
            class="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-10 text-center"
          >
            <p class="text-sm font-medium text-slate-900">
              Item details unavailable
            </p>
            <p class="mt-2 text-sm text-slate-600">
              This order can still be tracked even when line-item details are not yet returned.
            </p>
          </div>
        </UCard>

        <OrderDeliveryVisibilityCard
          :delivery="resolvedDelivery"
          :is-loading="isLoadingDelivery"
          :load-error="deliveryError"
        />
      </div>

      <UCard>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Status Timeline
          </p>
          <h2 class="mt-2 text-xl font-semibold text-slate-900">
            Tracking Progress
          </h2>
          <p class="mt-2 text-sm text-slate-600">
            This timeline reflects the current order status using the supported repository statuses.
          </p>
        </div>

        <div class="mt-6">
          <OrderStatusTimeline :order="order" />
        </div>
      </UCard>
    </div>
  </div>
</template>
