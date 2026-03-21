<script setup lang="ts">
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

const resetForm = () => {
  form.name = "";
  form.contact_name = "";
  form.phone = "";
  form.email = "";
  form.address = "";
};

const normalize = (value: string) => {
  const trimmed = value.trim();
  return trimmed.length ? trimmed : undefined;
};

const handleSave = async () => {
  if (!form.name.trim()) return;
  isSaving.value = true;
  const response = await supplierStore.createSupplier({
    name: normalize(form.name),
    contact_name: normalize(form.contact_name),
    phone: normalize(form.phone),
    email: normalize(form.email),
    address: normalize(form.address),
  });
  isSaving.value = false;

  if (
    !notifyResponse(response, {
      successTitle: "Supplier created",
      successDescription: `Added ${form.name.trim()}.`,
      errorTitle: "Supplier not created",
    })
  ) {
    return;
  }

  resetForm();
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
          <UInput v-model="form.name" class="w-full" placeholder="Atlas Aggregates" />
        </UFormField>
        <UFormField label="Contact name">
          <UInput
            v-model="form.contact_name"
            class="w-full"
            placeholder="Kim Warren"
          />
        </UFormField>
        <div class="grid gap-4 md:grid-cols-2">
          <UFormField label="Phone">
            <UInput
              v-model="form.phone"
              class="w-full"
              placeholder="+1-555-555-5555"
            />
          </UFormField>
          <UFormField label="Email">
            <UInput
              v-model="form.email"
              class="w-full"
              placeholder="contact@supplier.com"
            />
          </UFormField>
        </div>
        <UFormField label="Address">
          <UTextarea
            v-model="form.address"
            class="w-full"
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
          :disabled="!form.name.trim()"
          :loading="isSaving"
          @click="handleSave"
        >
          Save
        </UButton>
      </div>
    </template>
  </UModal>
</template>
