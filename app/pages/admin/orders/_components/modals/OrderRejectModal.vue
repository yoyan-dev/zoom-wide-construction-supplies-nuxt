<script setup lang="ts">
import type { Order } from "~/types/order";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const props = defineProps<{
  payload: Order | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const orderStore = useOrderStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);
const rejectionReason = ref("");

watch(
  () => props.payload?.id,
  () => {
    rejectionReason.value = "";
  },
  { immediate: true },
);

const handleReject = async () => {
  const orderId = props.payload?.id;
  const reason = rejectionReason.value.trim();

  if (!orderId || !reason) {
    return;
  }

  isSaving.value = true;
  const response = await orderStore.rejectOrder(orderId, {
    rejection_reason: reason,
  });
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Order rejected",
      successDescription: `Order ${orderId} was rejected.`,
      errorTitle: "Order not rejected",
    })
  ) {
    return;
  }

  emit("close", false);
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Reject Order
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.id ? `Order ${props.payload.id}` : "Order" }}
        </h3>
      </div>
    </template>
    <template #body>
      <div class="space-y-4">
        <p class="text-sm text-slate-600">
          Add the reason that should be stored with this rejected order.
        </p>
        <UFormField label="Rejection reason">
          <UTextarea
            v-model="rejectionReason"
            class="w-full"
            placeholder="Explain why this order cannot be approved."
          />
        </UFormField>
      </div>
    </template>
    <template #footer>
      <div class="flex w-full justify-end gap-2">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton
          color="error"
          :disabled="!rejectionReason.trim()"
          :loading="isSaving"
          @click="handleReject"
        >
          Reject Order
        </UButton>
      </div>
    </template>
  </UModal>
</template>
