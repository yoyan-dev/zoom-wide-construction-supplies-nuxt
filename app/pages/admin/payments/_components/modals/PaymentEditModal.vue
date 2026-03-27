<script setup lang="ts">
import PaymentForm from "../PaymentForm.vue";
import type { Payment, UpdatePaymentPayload } from "~/types/payment";
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

const props = defineProps<{
  payload: Payment | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const paymentStore = usePaymentStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const handleSave = async (payload: UpdatePaymentPayload) => {
  const paymentId = props.payload?.id;

  if (!paymentId) {
    return;
  }

  isSaving.value = true;
  const response = await paymentStore.updatePayment(paymentId, payload);
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Payment updated",
      successDescription: `Saved changes to payment ${paymentId}.`,
      errorTitle: "Payment not updated",
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
          Update Payment
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.id ? `Payment ${props.payload.id}` : "Payment" }}
        </h3>
      </div>
    </template>
    <template #body>
      <PaymentForm
        mode="edit"
        :payment="props.payload"
        :orders="[]"
        submit-label="Save Payment Updates"
        :is-submitting="isSaving"
        @submit="handleSave"
        @cancel="emit('close', false)"
      />
    </template>
  </UModal>
</template>
