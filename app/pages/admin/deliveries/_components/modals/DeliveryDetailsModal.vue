<script setup lang="ts">
import type { Delivery } from "~/types/delivery";
import { formatLongDate } from "~/utils/format";

const props = defineProps<{
  payload: Delivery | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const delivery = computed(() => props.payload);
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Delivery Details
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ delivery?.id ?? "Delivery" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="grid gap-4 text-sm text-slate-600">
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Order
            </p>
            <p class="mt-1">{{ delivery?.order_id ?? "N/A" }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Status
            </p>
            <p class="mt-1">{{ delivery?.status ?? "Unknown" }}</p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Driver
            </p>
            <p class="mt-1">{{ delivery?.driver_id ?? "Unassigned" }}</p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Vehicle
            </p>
            <p class="mt-1">{{ delivery?.vehicle_number ?? "TBD" }}</p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Scheduled at
            </p>
            <p class="mt-1">
              {{
                delivery?.scheduled_at
                  ? formatLongDate(delivery.scheduled_at)
                  : "TBD"
              }}
            </p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Delivered at
            </p>
            <p class="mt-1">
              {{
                delivery?.delivered_at
                  ? formatLongDate(delivery.delivered_at)
                  : "Not delivered"
              }}
            </p>
          </div>
        </div>
        <div class="grid gap-3 sm:grid-cols-2">
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Created
            </p>
            <p class="mt-1">
              {{ delivery ? formatLongDate(delivery.created_at) : "N/A" }}
            </p>
          </div>
          <div>
            <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
              Updated
            </p>
            <p class="mt-1">
              {{ delivery ? formatLongDate(delivery.updated_at) : "N/A" }}
            </p>
          </div>
        </div>
      </div>
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
