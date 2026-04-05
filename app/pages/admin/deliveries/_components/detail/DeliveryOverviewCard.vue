<script setup lang="ts">
import type { Delivery } from "~/types/delivery";
import { formatLongDate } from "~/utils/format";
import { getDeliveryStatusBadge } from "~/pages/orders/_components/shared/delivery-status-badge";

const props = defineProps<{
  delivery: Delivery;
}>();
</script>

<template>
  <UCard>
    <div class="flex flex-wrap items-center justify-between gap-4">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Delivery Overview
        </p>
        <h2 class="mt-2 text-xl font-semibold text-slate-900">
          Delivery {{ props.delivery.id }}
        </h2>
      </div>

      <UBadge
        :color="getDeliveryStatusBadge(props.delivery.status).color"
        variant="subtle"
      >
        {{ getDeliveryStatusBadge(props.delivery.status).label }}
      </UBadge>
    </div>

    <div class="mt-6 grid gap-4 md:grid-cols-2">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Linked Order
        </p>
        <p class="mt-2 font-medium text-slate-900">
          {{ props.delivery.order_id }}
        </p>
      </div>

      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Created
        </p>
        <p class="mt-2 font-medium text-slate-900">
          {{ formatLongDate(props.delivery.created_at) }}
        </p>
      </div>

      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Last Updated
        </p>
        <p class="mt-2 font-medium text-slate-900">
          {{ formatLongDate(props.delivery.updated_at) }}
        </p>
      </div>
    </div>
  </UCard>
</template>
