<script setup lang="ts">
import type { Delivery } from "~/types/delivery";
import { formatLongDate, formatShortDateOrFallback } from "~/utils/format";
import DeliveryStatusTimeline from "./shared/DeliveryStatusTimeline.vue";
import { getDeliveryStatusBadge } from "./shared/delivery-status-badge";

const props = defineProps<{
  delivery: Delivery | null;
  isLoading?: boolean;
  loadError?: string | null;
}>();
</script>

<template>
  <UCard>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Delivery Visibility
        </p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">
          Delivery updates
        </h2>
        <p class="mt-2 text-sm text-slate-600">
          Review the current delivery stage for this order using the latest fulfillment data available.
        </p>
      </div>

      <UBadge
        :color="getDeliveryStatusBadge(props.delivery?.status).color"
        variant="subtle"
      >
        {{ getDeliveryStatusBadge(props.delivery?.status).label }}
      </UBadge>
    </div>

    <div v-if="props.isLoading" class="mt-6 space-y-4">
      <USkeleton class="h-5 w-40" />
      <USkeleton class="h-4 w-full" />
      <USkeleton class="h-4 w-4/5" />
    </div>

    <div
      v-else-if="props.loadError"
      class="mt-6 rounded-2xl border border-dashed border-rose-200 bg-rose-50/60 px-6 py-8"
    >
      <p class="text-sm font-medium text-rose-900">
        Delivery updates unavailable
      </p>
      <p class="mt-2 text-sm text-rose-700">
        {{ props.loadError }}
      </p>
    </div>

    <div
      v-else-if="!props.delivery"
      class="mt-6 rounded-2xl border border-dashed border-slate-200 bg-slate-50/70 px-6 py-8"
    >
      <p class="text-sm font-medium text-slate-900">
        Delivery not scheduled yet
      </p>
      <p class="mt-2 text-sm text-slate-600">
        Delivery details will appear here once this order moves into the fulfillment stage.
      </p>
    </div>

    <template v-else>
      <div class="mt-6 grid gap-4 md:grid-cols-2">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Delivery Reference
          </p>
          <p class="mt-2 font-medium text-slate-900">
            {{ props.delivery.id }}
          </p>
        </div>

        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Scheduled
          </p>
          <p class="mt-2 font-medium text-slate-900">
            {{ formatShortDateOrFallback(props.delivery.scheduled_at, "Not scheduled") }}
          </p>
        </div>

        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Delivered
          </p>
          <p class="mt-2 font-medium text-slate-900">
            {{
              props.delivery.delivered_at
                ? formatLongDate(props.delivery.delivered_at)
                : "Not delivered yet"
            }}
          </p>
        </div>

        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Vehicle
          </p>
          <p class="mt-2 font-medium text-slate-900">
            {{ props.delivery.vehicle_number ?? "Not assigned" }}
          </p>
        </div>
      </div>

      <div class="mt-6 flex flex-wrap items-center gap-3">
        <UButton
          color="neutral"
          variant="outline"
          :to="`/orders/${props.delivery.order_id}`"
        >
          Back to Order Tracking
        </UButton>
      </div>

      <div class="mt-6">
        <DeliveryStatusTimeline :delivery="props.delivery" />
      </div>
    </template>
  </UCard>
</template>
