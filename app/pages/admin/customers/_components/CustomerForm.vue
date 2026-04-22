<script setup lang="ts">
import type { Customer, CustomerType } from "~/types/customer";
import { CUSTOMER_TYPE_OPTIONS } from "./customer-options";

export type CustomerSubmitValue = {
  user_id?: string;
  customer_type: CustomerType;
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
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", value: CustomerSubmitValue): void;
  (e: "cancel"): void;
}>();

const draft = reactive({
  user_id: "",
  customer_type: "customer" as CustomerType,
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
    draft.customer_type =
      value?.customer_type === "contractor" ? "contractor" : "customer";
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
    customer_type: draft.customer_type,
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
      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Record type" required>
          <USelect
            v-model="draft.customer_type"
            class="w-full"
            :items="CUSTOMER_TYPE_OPTIONS"
            placeholder="Select type"
          />
        </UFormField>

        <UFormField label="Company name">
          <UInput
            v-model="draft.company_name"
            class="w-full"
            placeholder="ABC Trading"
          />
        </UFormField>
      </div>

      <div class="grid gap-4 md:grid-cols-2">
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

    <div class="mt-6 flex items-center justify-end gap-2">
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
