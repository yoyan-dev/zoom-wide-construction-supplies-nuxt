<script setup lang="ts">
import type { Delivery } from "~/types/delivery";

const props = defineProps<{
  payload: Delivery | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Delivery Address
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.id ?? "Delivery" }}
        </h3>
      </div>
    </template>
    <template #body>
      <p class="text-sm text-slate-600">
        Delivery address is not available for this record.
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
