<script setup lang="ts">
import type { Customer } from "~/types/customer";

export type CustomerSubmitValue = {
  user_id?: string;
  company_name: string;
  contact_name: string;
  phone?: string;
  email: string;
  billing_address?: string;
  shipping_address?: string;
};

const props = defineProps<{
  customer: Customer | null;
  submitLabel: string;
  cancelLabel?: string;
  showActions?: boolean;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", value: CustomerSubmitValue): void;
  (e: "cancel"): void;
}>();

const draft = reactive({
  user_id: "",
  company_name: "",
  contact_name: "",
  phone: "",
  email: "",
  billing_address: "",
  shipping_address: "",
});

const normalize = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

watch(
  () => props.customer,
  (value) => {
    draft.user_id = value?.user_id ?? "";
    draft.company_name = value?.company_name ?? "";
    draft.contact_name = value?.contact_name ?? "";
    draft.phone = value?.phone ?? "";
    draft.email = value?.email ?? "";
    draft.billing_address = value?.billing_address ?? "";
    draft.shipping_address = value?.shipping_address ?? "";
  },
  { immediate: true },
);

const isSubmitDisabled = computed(
  () =>
    !draft.company_name.trim() ||
    !draft.contact_name.trim() ||
    !draft.email.trim(),
);

const handleSubmit = () => {
  if (isSubmitDisabled.value) {
    return;
  }

  emit("submit", {
    user_id: normalize(draft.user_id),
    company_name: draft.company_name.trim(),
    contact_name: draft.contact_name.trim(),
    phone: normalize(draft.phone),
    email: draft.email.trim(),
    billing_address: normalize(draft.billing_address),
    shipping_address: normalize(draft.shipping_address),
  });
};
</script>

<template>
  <UForm @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <UFormField
        label="Linked account ID"
        description="Optional user account ID tied to this customer record."
      >
        <UInput
          v-model="draft.user_id"
          class="w-full"
          placeholder="user_123"
        />
      </UFormField>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Company name">
          <UInput
            v-model="draft.company_name"
            class="w-full"
            placeholder="ABC Trading"
          />
        </UFormField>

        <UFormField label="Contact name">
          <UInput
            v-model="draft.contact_name"
            class="w-full"
            placeholder="Jane Doe"
          />
        </UFormField>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Email">
          <UInput
            v-model="draft.email"
            class="w-full"
            placeholder="customer@example.com"
            type="email"
          />
        </UFormField>

        <UFormField label="Phone">
          <UInput
            v-model="draft.phone"
            class="w-full"
            placeholder="+63 900 000 0000"
          />
        </UFormField>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Billing address">
          <UTextarea
            v-model="draft.billing_address"
            class="w-full"
            placeholder="Billing address"
          />
        </UFormField>

        <UFormField label="Shipping address">
          <UTextarea
            v-model="draft.shipping_address"
            class="w-full"
            placeholder="Shipping address"
          />
        </UFormField>
      </div>
    </div>

    <div
      v-if="props.showActions !== false"
      class="mt-6 flex items-center justify-end gap-2"
    >
      <UButton
        color="neutral"
        variant="ghost"
        type="button"
        @click="emit('cancel')"
      >
        {{ props.cancelLabel ?? "Cancel" }}
      </UButton>
      <UButton
        color="primary"
        type="submit"
        :disabled="isSubmitDisabled"
        :loading="props.isSubmitting"
      >
        {{ props.submitLabel }}
      </UButton>
    </div>
  </UForm>
</template>
