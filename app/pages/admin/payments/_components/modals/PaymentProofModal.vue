<script setup lang="ts">
import type { Payment } from "~/types/payment";

const props = defineProps<{
  payload: Payment | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Payment Proof
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.id ?? "Payment" }}
        </h3>
      </div>
    </template>
    <template #body>
      <p class="text-sm text-slate-600">
        Reference: {{ props.payload?.transaction_ref ?? "No proof uploaded." }}
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
