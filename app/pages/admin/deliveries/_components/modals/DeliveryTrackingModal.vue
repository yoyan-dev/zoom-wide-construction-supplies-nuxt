<script setup lang="ts">
import type { Delivery } from "~/types/delivery";
import { storeToRefs } from "pinia";

const props = defineProps<{
  payload: Delivery | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const deliveryStore = useDeliveryStore();
const { deliveryMeta } = storeToRefs(deliveryStore);

const meta = computed(() =>
  props.payload?.id ? deliveryMeta.value[props.payload.id] ?? {} : {},
);
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Tracking Updates
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.id ?? "Delivery" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="grid gap-4 text-sm text-slate-600">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Last location
          </p>
          <p class="mt-1">{{ meta.location ?? "No location updates." }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Route
          </p>
          <p class="mt-1">{{ meta.route ?? "No route assigned." }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Warehouse staff
          </p>
          <p class="mt-1">{{ meta.warehouse_staff ?? "Unassigned" }}</p>
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
