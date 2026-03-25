<script setup lang="ts">
import type { Supplier } from "~/types/supplier";

type SupplierSubmitValue = {
  name: string;
  contact_name?: string;
  phone?: string;
  email?: string;
  address?: string;
};

const props = defineProps<{
  supplier: Supplier | null;
  submitLabel: string;
  cancelLabel?: string;
  showActions?: boolean;
  isSubmitting?: boolean;
}>();

const emit = defineEmits<{
  (e: "submit", value: SupplierSubmitValue): void;
  (e: "cancel"): void;
}>();

const draft = reactive({
  name: "",
  contact_name: "",
  phone: "",
  email: "",
  address: "",
});

const normalize = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

watch(
  () => props.supplier,
  (value) => {
    draft.name = value?.name ?? "";
    draft.contact_name = value?.contact_name ?? "";
    draft.phone = value?.phone ?? "";
    draft.email = value?.email ?? "";
    draft.address = value?.address ?? "";
  },
  { immediate: true },
);

const handleSubmit = () => {
  const name = draft.name.trim();

  if (!name) return;

  emit("submit", {
    name,
    contact_name: normalize(draft.contact_name),
    phone: normalize(draft.phone),
    email: normalize(draft.email),
    address: normalize(draft.address),
  });
};
</script>

<template>
  <UForm @submit.prevent="handleSubmit">
    <div class="space-y-4">
      <UFormField label="Supplier name">
        <UInput
          v-model="draft.name"
          name="name"
          class="w-full"
          placeholder="Atlas Aggregates"
        />
      </UFormField>

      <UFormField label="Contact name">
        <UInput
          v-model="draft.contact_name"
          name="contact_name"
          class="w-full"
          placeholder="Kim Warren"
        />
      </UFormField>

      <div class="grid gap-4 md:grid-cols-2">
        <UFormField label="Phone">
          <UInput
            v-model="draft.phone"
            name="phone"
            class="w-full"
            placeholder="+1-555-555-5555"
          />
        </UFormField>

        <UFormField label="Email">
          <UInput
            v-model="draft.email"
            name="email"
            class="w-full"
            placeholder="contact@supplier.com"
          />
        </UFormField>
      </div>

      <UFormField label="Address">
        <UTextarea
          v-model="draft.address"
          name="address"
          class="w-full"
          placeholder="Street, City, State"
        />
      </UFormField>
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
        {{ cancelLabel ?? "Cancel" }}
      </UButton>
      <UButton
        color="primary"
        type="submit"
        :disabled="!draft.name.trim()"
        :loading="props.isSubmitting"
      >
        {{ submitLabel }}
      </UButton>
    </div>
  </UForm>
</template>
