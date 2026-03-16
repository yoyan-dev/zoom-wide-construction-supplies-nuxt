<script setup lang="ts">
import type { InventoryLog } from "~/types/inventory";
import { storeToRefs } from "pinia";
import { formatShortDate } from "~/utils/format";

const props = defineProps<{
  payload: InventoryLog | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const inventoryStore = useInventoryStore();
const { logs } = storeToRefs(inventoryStore);

const history = computed(() =>
  props.payload?.product_id
    ? logs.value.filter((entry) => entry.product_id === props.payload?.product_id)
    : [],
);
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Stock History
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.product_id ?? "Inventory" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="space-y-3 text-sm text-slate-600">
        <div
          v-for="entry in history"
          :key="entry.id"
          class="flex items-center justify-between rounded-lg border border-slate-200/70 p-3"
        >
          <div>
            <p class="text-sm font-medium text-slate-800">
              {{ entry.movement_type }}
            </p>
            <p class="text-xs text-slate-500">
              {{ formatShortDate(entry.created_at) }}
            </p>
          </div>
          <div class="text-sm font-semibold text-slate-800">
            {{ entry.quantity_change }}
          </div>
        </div>
        <p v-if="!history.length" class="text-sm text-slate-500">
          No stock movements recorded.
        </p>
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
