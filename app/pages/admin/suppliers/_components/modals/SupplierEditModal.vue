<script setup lang="ts">
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";
import type { Supplier } from "~/types/supplier";

const props = defineProps<{
  payload: Supplier | null;
}>();

const emit = defineEmits<{ close: [boolean] }>();

const supplierStore = useSupplierStore();
const { notifyResponse } = useAdminResponseToast();
const isSaving = ref(false);

const form = reactive({
  name: "",
  contact_name: "",
  phone: "",
  email: "",
  address: "",
});

const supplierId = computed(() => props.payload?.id ?? "");

watch(
  () => props.payload,
  (value) => {
    form.name = value?.name ?? "";
    form.contact_name = value?.contact_name ?? "";
    form.phone = value?.phone ?? "";
    form.email = value?.email ?? "";
    form.address = value?.address ?? "";
  },
  { immediate: true },
);

const normalize = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const handleSave = async () => {
  if (!supplierId.value) return;
  if (!form.name.trim()) return;
  isSaving.value = true;
  const response = await supplierStore.updateSupplier(supplierId.value, {
    name: normalize(form.name),
    contact_name: normalize(form.contact_name),
    phone: normalize(form.phone),
    email: normalize(form.email),
    address: normalize(form.address),
  });
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Supplier updated",
      successDescription: `Saved changes to ${form.name.trim()}.`,
      errorTitle: "Supplier not updated",
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
          Edit Supplier
        </p>
        <h3 class="mt-2 text-lg font-semibold">Edit supplier details</h3>
      </div>
    </template>
    <template #body>
      <div class="space-y-4">
        <UFormField label="Supplier name">
          <UInput
            class="w-full"
            v-model="form.name"
            name="name"
            placeholder="Atlas Aggregates"
          />
        </UFormField>
        <UFormField label="Contact name">
          <UInput
            class="w-full"
            v-model="form.contact_name"
            name="contact_name"
            placeholder="Kim Warren"
          />
        </UFormField>
        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="Phone">
            <UInput
              class="w-full"
              v-model="form.phone"
              name="phone"
              placeholder="+1-555-555-5555"
            />
          </UFormField>
          <UFormField label="Email">
            <UInput
              class="w-full"
              v-model="form.email"
              name="email"
              placeholder="contact@supplier.com"
            />
          </UFormField>
        </div>
        <UFormField label="Address">
          <UTextarea
            class="w-full"
            v-model="form.address"
            name="address"
            placeholder="Street, City, State"
          />
        </UFormField>
      </div>
    </template>

    <template #footer>
      <div class="flex justify-end gap-2 w-full">
        <UButton color="neutral" variant="ghost" @click="emit('close', false)">
          Cancel
        </UButton>
        <UButton
          color="primary"
          :disabled="!supplierId || !form.name.trim()"
          :loading="isSaving"
          @click="handleSave"
        >
          Save Changes
        </UButton>
      </div>
    </template>
  </UModal>
</template>
