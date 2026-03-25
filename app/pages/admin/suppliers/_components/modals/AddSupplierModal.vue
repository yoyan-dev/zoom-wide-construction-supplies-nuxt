<script setup lang="ts">
import { useAdminResponseToast } from "~/composables/admin/useAdminResponseToast";

defineProps<{ payload?: unknown }>();
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

const appendIfPresent = (formData: FormData, key: string, value: string) => {
  const trimmed = value.trim();

  if (trimmed) {
    formData.append(key, trimmed);
  }
};

const handleSave = async () => {
  const name = form.name.trim();

  if (!name) return;

  const formData = new FormData();
  formData.append("name", name);
  appendIfPresent(formData, "contact_name", form.contact_name);
  appendIfPresent(formData, "phone", form.phone);
  appendIfPresent(formData, "email", form.email);
  appendIfPresent(formData, "address", form.address);

  isSaving.value = true;
  const response = await supplierStore.createSupplier(formData);
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Supplier created",
      successDescription: `Added ${name}.`,
      errorTitle: "Supplier not created",
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
          New Supplier
        </p>
        <h3 class="mt-2 text-lg font-semibold">Create a supplier</h3>
      </div>
    </template>

    <template #body>
      <div class="space-y-4">
        <UFormField label="Supplier name">
          <UInput
            v-model="form.name"
            name="name"
            class="w-full"
            placeholder="Atlas Aggregates"
          />
        </UFormField>
        <UFormField label="Contact name">
          <UInput
            v-model="form.contact_name"
            name="contact_name"
            class="w-full"
            placeholder="Kim Warren"
          />
        </UFormField>
        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="Phone">
            <UInput
              v-model="form.phone"
              name="phone"
              class="w-full"
              placeholder="+1-555-555-5555"
            />
          </UFormField>
          <UFormField label="Email">
            <UInput
              v-model="form.email"
              name="email"
              class="w-full"
              placeholder="contact@supplier.com"
            />
          </UFormField>
        </div>
        <UFormField label="Address">
          <UTextarea
            v-model="form.address"
            name="address"
            class="w-full"
            placeholder="Street, City, State"
          />
        </UFormField>
        <div class="flex justify-end gap-2 w-full">
          <UButton
            color="neutral"
            variant="ghost"
            @click="emit('close', false)"
          >
            Cancel
          </UButton>
          <UButton
            color="primary"
            :disabled="!form.name.trim()"
            :loading="isSaving"
            @click="handleSave"
          >
            Save
          </UButton>
        </div>
      </div>
    </template>
  </UModal>
</template>
