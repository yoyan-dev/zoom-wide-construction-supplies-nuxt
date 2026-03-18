<script setup lang="ts">
import type { InventoryLog } from "~/types/inventory";

const props = defineProps<{
  payload:
    | {
        log: InventoryLog;
        productName: string;
        warehouse: string;
      }
    | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Adjustment Details
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.log.id ?? "Adjustment" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="grid gap-4 text-sm text-slate-600">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Product</p>
          <p class="mt-1">
            {{ props.payload?.productName ?? props.payload?.log.product_id }}
          </p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Warehouse</p>
          <p class="mt-1">{{ props.payload?.warehouse ?? "Unknown" }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Type</p>
          <p class="mt-1">{{ props.payload?.log.movement_type }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Quantity</p>
          <p class="mt-1">{{ props.payload?.log.quantity_change }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Reason</p>
          <p class="mt-1">{{ props.payload?.log.note ?? "No notes" }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Adjusted by</p>
          <p class="mt-1">{{ props.payload?.log.created_by ?? "System" }}</p>
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
