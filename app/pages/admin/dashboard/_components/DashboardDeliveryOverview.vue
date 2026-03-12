<script setup lang="ts">
import type { DashboardDeliverySummary } from "~/types/dashboard";
import type { Delivery } from "~/types/delivery";
import { formatShortDate } from "~/utils/format";

const props = defineProps<{
  statuses: DashboardDeliverySummary[];
  deliveries: Delivery[];
}>();

const activeDeliveries = computed(() =>
  props.deliveries.filter(
    (delivery) =>
      delivery.status === "scheduled" || delivery.status === "in_transit",
  ),
);

type BadgeColor =
  | "primary"
  | "secondary"
  | "success"
  | "info"
  | "warning"
  | "error"
  | "neutral";

const toneMap: Record<Delivery["status"], BadgeColor> = {
  scheduled: "warning",
  in_transit: "info",
  delivered: "success",
  failed: "error",
};
</script>

<template>
  <UCard>
    <div class="mb-4 flex items-center justify-between">
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Delivery Control
        </p>
        <p class="mt-1 text-lg font-semibold">Fleet visibility</p>
      </div>
      <UButton color="neutral" variant="ghost" icon="i-lucide-route">
        Dispatch
      </UButton>
    </div>

    <div class="flex flex-wrap gap-2">
      <UBadge
        v-for="status in props.statuses"
        :key="status.status"
        :color="toneMap[status.status]"
        variant="subtle"
        class="capitalize"
      >
        {{ status.status.replace("_", " ") }} · {{ status.count }}
      </UBadge>
    </div>

    <div class="mt-4 space-y-3">
      <div
        v-for="delivery in activeDeliveries"
        :key="delivery.id"
        class="flex items-center justify-between rounded-2xl border border-slate-200/70 bg-slate-50/80 px-4 py-3"
      >
        <div>
          <p class="text-sm font-medium">
            {{ delivery.order_id }}
          </p>
          <p class="text-xs text-slate-500">
            {{ delivery.driver_name ?? "Driver unassigned" }} ·
            {{ delivery.vehicle_number ?? "Vehicle TBA" }}
          </p>
        </div>
        <div class="text-right">
          <UBadge :color="toneMap[delivery.status]" variant="subtle">
            {{ delivery.status.replace("_", " ") }}
          </UBadge>
          <p class="mt-1 text-xs text-slate-500">
            ETA
            {{
              delivery.scheduled_at
                ? formatShortDate(delivery.scheduled_at)
                : "TBD"
            }}
          </p>
        </div>
      </div>
      <p v-if="!activeDeliveries.length" class="text-xs text-slate-500">
        No active deliveries scheduled right now.
      </p>
    </div>
  </UCard>
</template>
