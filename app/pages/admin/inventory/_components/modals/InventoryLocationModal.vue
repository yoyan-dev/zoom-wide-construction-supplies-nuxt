<script setup lang="ts">
import type { InventoryLog } from "~/types/inventory";
import { storeToRefs } from "pinia";

const props = defineProps<{
  payload: InventoryLog | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const inventoryStore = useInventoryStore();
const { inventoryMeta } = storeToRefs(inventoryStore);

const meta = computed(() =>
  props.payload?.id ? inventoryMeta.value[props.payload.id] ?? {} : {},
);
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Warehouse & Location
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.product_id ?? "Inventory" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="grid gap-4 text-sm text-slate-600">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Warehouse
          </p>
          <p class="mt-1">{{ meta.warehouse ?? "Not assigned" }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Location
          </p>
          <p class="mt-1">{{ meta.location ?? "Not assigned" }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
            Status
          </p>
          <p class="mt-1">{{ meta.status ?? "available" }}</p>
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
