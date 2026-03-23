<script setup lang="ts">
type ActionConfirmPayload = {
  title: string;
  description?: string;
  confirmLabel?: string;
  confirmColor?: string;
  onConfirm?: () => Promise<boolean | void> | boolean | void;
};

const props = defineProps<{
  payload: ActionConfirmPayload | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();
const isWorking = ref(false);

const handleConfirm = async () => {
  if (!props.payload?.onConfirm) {
    emit("close", false);
    return;
  }

  isWorking.value = true;
  const shouldClose = (await props.payload.onConfirm()) !== false;
  isWorking.value = false;

  if (shouldClose) {
    emit("close", false);
  }
};
</script>

<template>
  <UModal :close="{ onClick: () => emit('close', false) }">
    <template #header>
      <div>
        <p class="text-xs uppercase tracking-[0.18em] text-slate-500">
          Confirmation
        </p>
        <h3 class="mt-2 text-lg font-semibold">
          {{ props.payload?.title ?? "Confirm action" }}
        </h3>
      </div>
    </template>
    <template #body>
      <p class="text-sm text-slate-600">
        {{ props.payload?.description ?? "Proceed with this action?" }}
      </p>
    </template>
    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton
          :color="props.payload?.confirmColor ?? 'primary'"
          :loading="isWorking"
          @click="handleConfirm"
        >
          {{ props.payload?.confirmLabel ?? "Confirm" }}
        </UButton>
      </div>
    </template>
  </UModal>
</template>
