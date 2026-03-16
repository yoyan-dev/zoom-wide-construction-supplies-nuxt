<script setup lang="ts">
import type { Order } from "~/types/order";
import { storeToRefs } from "pinia";
import { formatLongDate } from "~/utils/format";

const props = defineProps<{
  payload: Order | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const deliveryStore = useDeliveryStore();
const { deliveries } = storeToRefs(deliveryStore);

const delivery = computed(() =>
  deliveries.value.find((item) => item.order_id === props.payload?.id),
);
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Order Delivery
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.id ?? "Order" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div v-if="delivery" class="grid gap-4 text-sm text-slate-600">
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Status
            </p>
            <p class="mt-1">{{ delivery.status }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Driver
            </p>
            <p class="mt-1">{{ delivery.driver_id ?? "Unassigned" }}</p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Vehicle
            </p>
            <p class="mt-1">{{ delivery.vehicle_number ?? "TBD" }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Scheduled at
            </p>
            <p class="mt-1">
              {{
                delivery.scheduled_at
                  ? formatLongDate(delivery.scheduled_at)
                  : "TBD"
              }}
            </p>
          </div>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Delivered at
          </p>
          <p class="mt-1">
            {{
              delivery.delivered_at
                ? formatLongDate(delivery.delivered_at)
                : "Not delivered"
            }}
          </p>
        </div>
      </div>
      <p v-else class="text-sm text-slate-500">
        No delivery record linked to this order.
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Close
        </UButton>
      </div>
    </template>
  </UModal>
</template>
