<script setup lang="ts">
import type { WarehouseTransfer } from "~/types/warehouse-transfer";

const props = defineProps<{
  payload: WarehouseTransfer | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Transfer Details
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.id ?? "Transfer" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="grid gap-4 text-sm text-slate-600">
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Product</p>
          <p class="mt-1">{{ props.payload?.product_id }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Source</p>
          <p class="mt-1">{{ props.payload?.source_warehouse }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Destination</p>
          <p class="mt-1">{{ props.payload?.destination_warehouse }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Quantity</p>
          <p class="mt-1">{{ props.payload?.quantity }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Status</p>
          <p class="mt-1">{{ props.payload?.status }}</p>
        </div>
        <div>
          <p class="text-xs uppercase tracking-[0.18em] text-slate-500">Created</p>
          <p class="mt-1">{{ props.payload?.created_at }}</p>
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
